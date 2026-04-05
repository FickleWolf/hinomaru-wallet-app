import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

import type { WalletConnectHandlers } from "@/application/ports/WalletConnectHandlers";
import { WalletConnectClient } from "@/infrastructure/clients/WalletConnectClient";

import { useWcAuthorizeTransfer } from "../hooks/walletConnect/useWcAuthorizeTransfer";
import { useWcGetAccount } from "../hooks/walletConnect/useWcGetAccount";
import { useWcSessionDelete } from "../hooks/walletConnect/useWcSessionDelete";
import { useWcSessionProposal } from "../hooks/walletConnect/useWcSessionProposal";
import { useWcSignIn } from "../hooks/walletConnect/useWcSignIn";

import { useShackwWalletContext } from "./ShackwWalletProvider";

import type { PropsWithChildren } from "react";

type WalletConnectType = {
  wcClient: WalletConnectClient | null;
  sessionProposal: ReturnType<typeof useWcSessionProposal>;
  sessionDelete: ReturnType<typeof useWcSessionDelete>;
  signIn: ReturnType<typeof useWcSignIn>;
  getAccount: ReturnType<typeof useWcGetAccount>;
  authorizeTransfer: ReturnType<typeof useWcAuthorizeTransfer>;
};

export const WalletConnectContext = createContext<WalletConnectType | undefined>(undefined);

export const WalletConnectProvider = ({ children }: PropsWithChildren) => {
  const { account } = useShackwWalletContext();

  const [wcClient, setWcClient] = useState<WalletConnectClient | null>(null);

  const sessionProposal = useWcSessionProposal();
  const sessionDelete = useWcSessionDelete(wcClient);
  const signIn = useWcSignIn(wcClient);
  const getAccount = useWcGetAccount();
  const authorizeTransfer = useWcAuthorizeTransfer();

  const handlers: WalletConnectHandlers = useMemo(
    () => ({
      onSessionProposal: sessionProposal.onSessionProposal,
      onSessionDelete: sessionDelete.onSessionDelete,
      onSignIn: signIn.onSignIn,
      onGetAccount: getAccount.onGetAccount,
      onAuthorizeTransfer: authorizeTransfer.onAuthorizeTransfer
    }),
    [
      sessionProposal.onSessionProposal,
      sessionDelete.onSessionDelete,
      signIn.onSignIn,
      getAccount.onGetAccount,
      authorizeTransfer.onAuthorizeTransfer
    ]
  );

  const handlersRef = useRef<WalletConnectHandlers>(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const creatingRef = useRef<Promise<WalletConnectClient> | null>(null);

  useEffect(() => {
    const wallet = account?.address;
    if (!wallet) return;

    let cancelled = false;

    (async () => {
      if (!wcClient) {
        if (!creatingRef.current) {
          creatingRef.current = WalletConnectClient.create(wallet, handlersRef.current);
        }
        const inst = await creatingRef.current;
        if (cancelled) return;

        inst.updateContext(wallet, handlersRef.current);
        setWcClient(inst);
        return;
      }

      wcClient.updateContext(wallet, handlersRef.current);
    })();

    return () => {
      cancelled = true;
    };
  }, [account?.address, wcClient]);

  return (
    <WalletConnectContext.Provider
      value={{ wcClient, sessionProposal, sessionDelete, signIn, getAccount, authorizeTransfer }}
    >
      {children}
    </WalletConnectContext.Provider>
  );
};

export const useWalletConnectContext = () => {
  const ctx = useContext(WalletConnectContext);
  if (!ctx) throw new Error("WalletConnectProvider is not mounted. Wrap your component with <WalletConnectProvider>.");
  return ctx;
};
