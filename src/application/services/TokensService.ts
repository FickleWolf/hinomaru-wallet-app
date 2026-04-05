import type { CreateQuoteQuery, QuotesGateway } from "@/application/ports/QuotesGateway";
import { CHAINS, type Chain } from "@/config/chain";
import { VIEM_PUBLIC_CLIENTS } from "@/config/viem";
import type { GetTokenBalanceCommand, TransferTokenCommand } from "@/domain/token";
import { TOKEN_REGISTRY } from "@/registries/ChainTokenRegistry";
import type { ShackwApiErrorBody } from "@/shared/exceptions";
import { ApiError, CustomError } from "@/shared/exceptions";
import { erc20TransferCall, hashExecutionIntent } from "@/shared/helpers/evm";
import { toDisplyValueStr, toMinUnits } from "@/shared/helpers/tokenUnits";

import type { TokensGateway, TransferTokenQuery } from "../ports/TokensGateway";
import type { Hex } from "viem";

export const TokensService = {
  async getTokenBalance(command: GetTokenBalanceCommand): Promise<string> {
    const { chain, wallet, token } = command;
    const erc20Contract = TOKEN_REGISTRY[token].contract[chain];
    try {
      if (!erc20Contract) throw new CustomError("ERC20コントラクトが取得できませんでした。");

      const balance = await erc20Contract.read.balanceOf([wallet]);
      return toDisplyValueStr(balance, token);
    } catch (error: unknown) {
      console.warn(error);

      if (error instanceof CustomError) throw new Error(error.message);

      throw new Error(`不明なエラーにより ${token} の残高取得に失敗しました。`);
    }
  },

  async transferToken(
    chain: Chain,
    command: TransferTokenCommand,
    quotesGateway: QuotesGateway,
    tokenGateway: TokensGateway
  ): Promise<Hex> {
    const { account, client, token, feeToken, recipient, amountDisplayValue, webhookUrl } = command;

    const amountMinUnits = toMinUnits(amountDisplayValue, token);

    const createQuoteQuery: CreateQuoteQuery = {
      chain,
      sender: account.address,
      recipient,
      token: { symbol: token },
      feeToken: { symbol: feeToken },
      amountMinUnits
    };

    try {
      const publicClient = VIEM_PUBLIC_CLIENTS[chain];
      const quote = await quotesGateway.create(createQuoteQuery);

      const tokenAddress = TOKEN_REGISTRY[token].contract[chain]?.address;
      const feeTokenAddress = TOKEN_REGISTRY[feeToken].contract[chain]?.address;
      if (!tokenAddress || !feeTokenAddress) throw new Error("トークンアドレスの解決に失敗しました。");

      // ===== Verification =====
      if (quote.chainId !== CHAINS[chain].id) throw new Error("チェーン情報が一致しません。");

      if (quote.sender !== account.address) throw new Error("送信元アドレスが一致しません。");

      if (quote.recipient !== recipient) throw new Error("送信先アドレスが一致しません。");

      if (quote.token.address.toLowerCase() !== tokenAddress.toLowerCase())
        throw new Error("送金トークン情報が一致しません。");

      if (quote.feeToken.address.toLowerCase() !== feeTokenAddress.toLowerCase())
        throw new Error("手数料トークン情報が一致しません。");

      const expiresAtSec = BigInt(Math.floor(new Date(quote.expiresAt).getTime() / 1000));

      const transferAmountCallData = erc20TransferCall({
        token: tokenAddress,
        to: recipient,
        amountMinUnits
      });

      const transferFeeCallData = erc20TransferCall({
        token: feeTokenAddress,
        to: quote.sponsor,
        amountMinUnits: quote.fee.minUnits
      });

      const expectedCallHash = hashExecutionIntent({
        chainId: quote.chainId,
        sender: account.address,
        calls: [transferAmountCallData, transferFeeCallData],
        nonce: quote.nonce,
        expiresAtSec
      });

      if (quote.callHash !== expectedCallHash) throw new Error("見積内容の検証に失敗しました。");

      // ===== End verification =====

      const txNonce = await publicClient.getTransactionCount({
        address: account.address,
        blockTag: "pending"
      });

      const authorization = await client.signAuthorization({
        account,
        contractAddress: quote.delegate,
        chainId: quote.chainId,
        nonce: txNonce
      });

      const transferTokenQuery: TransferTokenQuery = {
        chain,
        quoteToken: quote.quoteToken,
        authorization,
        notify: webhookUrl
          ? {
              webhook: {
                id: "wallet:transfer",
                url: webhookUrl,
                echo: "mySecretVerificationToken"
              }
            }
          : undefined
      };

      const { txHash } = await tokenGateway.transfer(transferTokenQuery);
      return txHash;
    } catch (error: unknown) {
      console.error(error);

      let mes = "送金処理中に不明なエラーが発生しました。";
      if (error instanceof ApiError) {
        const body = error.body as ShackwApiErrorBody;
        const code = body.errors[0]?.code ?? "";

        if (code === "BAD_REQUEST") mes = "リクエスト内容が不正です。";
        if (code.includes("INSUFFICIENT")) mes = "残高が不足しています。";
        throw new Error(mes);
      }
      throw new Error(`${mes}: ${String(error)}`);
    }
  }
};
