import { createContext, useContext, useEffect } from "react";

import type { AddressesRepository } from "@/application/ports/AddressesRepository";
import type { LocalTransactionsRepository } from "@/application/ports/LocalTransactionsRepository";
import type { PrivateKeyRepository } from "@/application/ports/PrivateKeyRepository";
import type { QuotesGateway } from "@/application/ports/QuotesGateway";
import type { RemoteTransactionsGateway } from "@/application/ports/RemoteTransactionsGateway";
import type { TokensGateway } from "@/application/ports/TokensGateway";
import type { UserSettingRepository } from "@/application/ports/UserSettingRepository";
import type { WalletMetaGateway } from "@/application/ports/WalletMetaGateway";

import { MaintenanceOverlay } from "../components/Maintenance";
import { useInfrastructureRepositories } from "../hooks/useInfrastructureRepositories";
import { useLoadingOverlay } from "../providers/LoadingOverlayProvider";

import type { ReactNode } from "react";

export type Dependencies = {
  addressesRepository: AddressesRepository;
  transactionsRepository: LocalTransactionsRepository;
  userSettingRepository: UserSettingRepository;
  quotesGateway: QuotesGateway;
  transactionsGateway: RemoteTransactionsGateway;
  tokensGateway: TokensGateway;
  walletMetaGateway: WalletMetaGateway;
  privateKeyRepository: PrivateKeyRepository;
};

type DependenciesContainerProviderProps = {
  appCheckToken: string;
  children: ReactNode;
};

const DependenciesContainerContext = createContext<Dependencies | undefined>(undefined);

export const DependenciesContainerProvider = (props: DependenciesContainerProviderProps) => {
  const { appCheckToken, children } = props;

  const { show, hide } = useLoadingOverlay();
  const { privateKeyRepository, ...rest } = useInfrastructureRepositories(appCheckToken);

  useEffect(() => {
    if (privateKeyRepository === undefined) show();
    else hide();
  }, [privateKeyRepository, show, hide]);

  if (privateKeyRepository === null)
    return <MaintenanceOverlay text={`セキュアストアへのアクセスが拒否されました。\nアプリを再起動してください。`} />;

  if (privateKeyRepository === undefined) return null;

  return (
    <DependenciesContainerContext.Provider value={{ ...rest, privateKeyRepository }}>
      {children}
    </DependenciesContainerContext.Provider>
  );
};

export const useDependenciesContainerContext = () => {
  const ctx = useContext(DependenciesContainerContext);
  if (!ctx)
    throw new Error(
      "DependenciesContainerProvider is not mounted. Wrap your component with <DependenciesContainerProvider>."
    );
  return ctx;
};
