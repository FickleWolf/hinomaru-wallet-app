import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useMemo, useState } from "react";

import type { AddressesRepository } from "@/application/ports/AddressesRepository";
import type { LocalTransactionsRepository } from "@/application/ports/LocalTransactionsRepository";
import type { PrivateKeyRepository } from "@/application/ports/PrivateKeyRepository";
import type { QuotesGateway } from "@/application/ports/QuotesGateway";
import type { RemoteTransactionsGateway } from "@/application/ports/RemoteTransactionsGateway";
import type { TokensGateway } from "@/application/ports/TokensGateway";
import type { UserSettingRepository } from "@/application/ports/UserSettingRepository";
import type { WalletMetaGateway } from "@/application/ports/WalletMetaGateway";
import { ENV } from "@/config/env";
import { HttpClient } from "@/infrastructure/clients/HttpClient";
import { HttpQuotesGateway } from "@/infrastructure/http/HttpQuotesGateway";
import { HttpRemoteTransactionsGateway } from "@/infrastructure/http/HttpRemoteTransactionsGateway";
import { HttpTokensGateway } from "@/infrastructure/http/HttpTokensGateway";
import { HttpWalletMetaGateway } from "@/infrastructure/http/HttpWalletMetaGateway";
import { SecureStorePrivateKeyRepository } from "@/infrastructure/secureStore/SecureStorePrivateKeyRepository";
import { SqlAddressesRepository } from "@/infrastructure/sql/SqlAddressesRepository";
import { SqlLocalTransactionsRepository } from "@/infrastructure/sql/SqlLocalTransactionsRepository";
import { SqlUserSettingRepository } from "@/infrastructure/sql/SqlUserSettingRepository";

export type UseInfrastructureRepositoriesResult = {
  addressesRepository: AddressesRepository;
  transactionsRepository: LocalTransactionsRepository;
  userSettingRepository: UserSettingRepository;
  quotesGateway: QuotesGateway;
  transactionsGateway: RemoteTransactionsGateway;
  tokensGateway: TokensGateway;
  walletMetaGateway: WalletMetaGateway;
  privateKeyRepository: PrivateKeyRepository | null | undefined;
};

export const useInfrastructureRepositories = (appCheckToken: string): UseInfrastructureRepositoriesResult => {
  const db = useSQLiteContext();
  const [privateKeyRepository, setPrivateKeyRepository] = useState<PrivateKeyRepository | null | undefined>(undefined);

  const addressesRepository = useMemo(() => new SqlAddressesRepository(db), [db]);
  const transactionsRepository = useMemo(() => new SqlLocalTransactionsRepository(db), [db]);
  const userSettingRepository = useMemo(() => new SqlUserSettingRepository(db), [db]);

  const shackwApiClient = useMemo(
    () =>
      new HttpClient({
        baseURL: ENV.SHACKW_API_URL,
        timeoutMs: 60_000,
        headers: { "X-App-Check-Token": appCheckToken }
      }),
    [appCheckToken]
  );
  const quotesGateway = useMemo(() => new HttpQuotesGateway(shackwApiClient), [shackwApiClient]);
  const transactionsGateway = useMemo(() => new HttpRemoteTransactionsGateway(shackwApiClient), [shackwApiClient]);
  const tokensGateway = useMemo(() => new HttpTokensGateway(shackwApiClient), [shackwApiClient]);
  const walletMetaGateway = useMemo(() => new HttpWalletMetaGateway(shackwApiClient), [shackwApiClient]);

  useEffect(() => {
    const init = async () => {
      try {
        const privateKeyRepository = await SecureStorePrivateKeyRepository.getInstance();
        setPrivateKeyRepository(privateKeyRepository);
      } catch {
        setPrivateKeyRepository(null);
      }
    };

    init();
  }, []);

  return {
    addressesRepository,
    transactionsRepository,
    userSettingRepository,
    quotesGateway,
    transactionsGateway,
    tokensGateway,
    walletMetaGateway,
    privateKeyRepository
  };
};
