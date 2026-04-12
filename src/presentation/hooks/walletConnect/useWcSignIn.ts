import { useCallback, useState } from "react";

import type {
  WalletConnectHandlers,
  ShackwSignInParams,
  ShackwSignInResult
} from "@/application/ports/WalletConnectHandlers";
import type { WalletConnectClient } from "@/infrastructure/clients/WalletConnectClient";
import { useShackwWalletContext } from "@/presentation/providers/ShackwWalletProvider";

import type { SignClientTypes } from "@walletconnect/types";

type PendingSignIn = {
  params: ShackwSignInParams;
  peerMeta?: SignClientTypes.Metadata;
  resolve: (res: ShackwSignInResult) => void;
  reject: (err: Error) => void;
};

export const useWcSignIn = (wcClient: WalletConnectClient | null) => {
  const { account, walletClient } = useShackwWalletContext();
  const [pendingSignIn, setPendingSignIn] = useState<PendingSignIn | null>(null);

  const onSignIn = useCallback<WalletConnectHandlers["onSignIn"]>(
    async params => {
      const peerMeta = wcClient?.getPeerMetadata?.(params.topic);
      return await new Promise<ShackwSignInResult>((resolve, reject) => {
        setPendingSignIn({ params, peerMeta: peerMeta ?? undefined, resolve, reject });
      });
    },
    [wcClient]
  );

  const onApproveSignIn = useCallback(async () => {
    if (!pendingSignIn) return;
    if (!account || !walletClient) {
      pendingSignIn.reject(new Error("アカウント情報を取得できません。"));
      setPendingSignIn(null);
      return;
    }

    try {
      const { resolve } = pendingSignIn;
      const signature = await walletClient.signMessage({
        account,
        message: pendingSignIn.params.message
      });

      resolve({
        address: account.address,
        signature
      });
    } catch (e) {
      pendingSignIn.reject(e instanceof Error ? e : new Error("サインインの署名に失敗しました。"));
    } finally {
      setPendingSignIn(null);
    }
  }, [account, pendingSignIn, walletClient]);

  const onCancelSignIn = useCallback(() => {
    if (!pendingSignIn) return;

    pendingSignIn.reject(new Error("ユーザーがサインインをキャンセルしました。"));
    setPendingSignIn(null);
  }, [pendingSignIn]);

  return { pendingSignIn, onSignIn, onApproveSignIn, onCancelSignIn };
};
