import { WalletKit } from "@reown/walletkit";
import { Core } from "@walletconnect/core";
import { getSdkError } from "@walletconnect/utils";
import * as v from "valibot";

import type { WalletConnectHandlers } from "@/application/ports/WalletConnectHandlers";
import { ENV } from "@/config/env";
import { buildApprovedNamespacesForShackw, WALLETCONNECT_METADATA } from "@/config/walletConnect";
import { CustomError } from "@/shared/exceptions";
import { ShackwAuthorizeTransferParamsSchema } from "@/shared/validations/schemas/ShackwAuthorizeTransferParamsSchema";
import { ShackwSignInParamsSchema } from "@/shared/validations/schemas/ShackwSignInParamsSchema";

import type { IWalletKit } from "@reown/walletkit";
import type { SignClientTypes } from "@walletconnect/types";
import type { Address } from "viem";

const PROJECT_ID = ENV.WALLETCONNECT_PROJECT_ID;

let singletonPromise: Promise<WalletConnectClient> | null = null;

export class WalletConnectClient {
  private wallet: Address;
  private handlers: WalletConnectHandlers;

  private walletKit: IWalletKit;
  private clientId: string;

  private constructor(walletKit: IWalletKit, clientId: string, wallet: Address, handlers: WalletConnectHandlers) {
    this.walletKit = walletKit;
    this.clientId = clientId;
    this.wallet = wallet;
    this.handlers = handlers;

    this.setupListeners();
  }

  static async create(wallet: Address, handlers: WalletConnectHandlers): Promise<WalletConnectClient> {
    if (!singletonPromise) {
      singletonPromise = (async () => {
        const core = new Core({ projectId: PROJECT_ID });
        const walletKit = await WalletKit.init({ core, metadata: WALLETCONNECT_METADATA });
        const clientId = await walletKit.engine.signClient.core.crypto.getClientId();
        return new WalletConnectClient(walletKit, clientId, wallet, handlers);
      })().catch(err => {
        singletonPromise = null;
        throw err;
      });
    }

    const inst = await singletonPromise;
    inst.updateContext(wallet, handlers);
    return inst;
  }

  updateContext(wallet: Address, handlers: WalletConnectHandlers) {
    this.wallet = wallet;
    this.handlers = handlers;
  }

  getClientId(): string {
    return this.clientId;
  }

  getRawClient(): IWalletKit {
    return this.walletKit;
  }

  getPeerMetadata(topic: string): SignClientTypes.Metadata | null {
    try {
      const session = this.walletKit.engine.signClient.session.get(topic);
      return session?.peer?.metadata ?? null;
    } catch {
      return null;
    }
  }

  async handleWalletConnectUri(uri: string): Promise<void> {
    try {
      await this.walletKit.pair({ uri });
    } catch (e) {
      console.error(e);
      throw new CustomError("WalletConnect の接続に失敗しました。", { cause: e });
    }
  }

  async disconnect(topic: string): Promise<void> {
    try {
      await this.walletKit.disconnectSession({
        topic,
        reason: getSdkError("USER_DISCONNECTED")
      });
    } catch (e) {
      throw new CustomError("WalletConnect セッションの切断に失敗しました。", { cause: e });
    }
  }

  private setupListeners() {
    this.walletKit.on("session_proposal", async proposal => {
      if (!this.handlers) return;

      const action = await this.handlers.onSessionProposal(proposal);

      if (action === "approve") {
        const namespaces = buildApprovedNamespacesForShackw(proposal.params, this.wallet);
        await this.walletKit.approveSession({
          id: proposal.id,
          namespaces
        });
      } else {
        await this.walletKit.rejectSession({
          id: proposal.id,
          reason: getSdkError("USER_REJECTED")
        });
      }
    });

    this.walletKit.on("session_request", async event => {
      if (!this.handlers) return;

      const { topic, params, id } = event;
      const { request } = params;
      const { method } = request;

      try {
        switch (method) {
          case "shackw_signIn": {
            const raw = request.params?.[0];

            const parsed = v.safeParse(ShackwSignInParamsSchema, raw);
            if (!parsed.success) {
              await this.walletKit.respondSessionRequest({
                topic,
                response: {
                  id,
                  jsonrpc: "2.0",
                  error: {
                    code: -32000,
                    message: "Invalid shackw_signIn params"
                  }
                }
              });
              return;
            }

            const { message } = parsed.output;

            const result = await this.handlers.onSignIn({
              topic,
              message
            });

            await this.walletKit.respondSessionRequest({
              topic,
              response: {
                id,
                jsonrpc: "2.0",
                result
              }
            });
            return;
          }

          case "shackw_getAccount": {
            const info = await this.handlers.onGetAccount({ topic });

            await this.walletKit.respondSessionRequest({
              topic,
              response: {
                id,
                jsonrpc: "2.0",
                result: info
              }
            });
            return;
          }

          case "shackw_authorizeTransfer": {
            const raw = request.params?.[0];

            const parsed = v.safeParse(ShackwAuthorizeTransferParamsSchema, raw);
            if (!parsed.success) {
              await this.walletKit.respondSessionRequest({
                topic,
                response: {
                  id,
                  jsonrpc: "2.0",
                  error: {
                    code: -32000,
                    message: "Invalid shackw_authorizeTransfer params"
                  }
                }
              });
              return;
            }

            const p = parsed.output;
            const result = await this.handlers.onAuthorizeTransfer({
              topic,
              chain: p.chain,
              token: p.token,
              feeToken: p.feeToken,
              recipient: p.recipient,
              amountDisplayValue: p.amountDisplayValue,
              delegate: p.delegate,
              quoteToken: p.quoteToken
            });

            if (!result.approved || !result.txHash) {
              await this.walletKit.respondSessionRequest({
                topic,
                response: {
                  id,
                  jsonrpc: "2.0",
                  error: getSdkError("USER_REJECTED")
                }
              });
              return;
            }

            await this.walletKit.respondSessionRequest({
              topic,
              response: {
                id,
                jsonrpc: "2.0",
                result: { txHash: result.txHash }
              }
            });
            return;
          }

          default: {
            await this.walletKit.respondSessionRequest({
              topic,
              response: {
                id,
                jsonrpc: "2.0",
                error: getSdkError("INVALID_METHOD")
              }
            });
            return;
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unexpected error";

        await this.walletKit.respondSessionRequest({
          topic,
          response: {
            id,
            jsonrpc: "2.0",
            error: {
              code: -32000,
              message: msg
            }
          }
        });
      }
    });

    this.walletKit.on("session_delete", async event => {
      if (!this.handlers) return;
      await this.handlers.onSessionDelete(event);
    });
  }
}
