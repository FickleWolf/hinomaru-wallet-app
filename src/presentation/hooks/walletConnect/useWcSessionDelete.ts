import { useCallback } from "react";

import type { WalletConnectHandlers } from "@/application/ports/WalletConnectHandlers";
import type { WalletConnectClient } from "@/infrastructure/clients/WalletConnectClient";

export const useWcSessionDelete = (wcClient: WalletConnectClient | null) => {
  const onSessionDelete = useCallback<WalletConnectHandlers["onSessionDelete"]>(
    async event => {
      if (!wcClient) throw new Error("接続中のウォレットが存在しません。");
      wcClient.disconnect(event.topic);
    },
    [wcClient]
  );

  return { onSessionDelete };
};
