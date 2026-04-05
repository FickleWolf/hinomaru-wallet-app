import type { PrivateKeyModel } from "@/domain/privateKey";

import { privateKeyResultToDomain } from "../mappers/privateKey";

import type { AddressesRepository } from "../ports/AddressesRepository";
import type { PrivateKeyRepository, PrivateKeyResult } from "../ports/PrivateKeyRepository";
import type { UserSettingRepository } from "../ports/UserSettingRepository";

export const InitializeWalletUsecase = {
  async execute(
    addressesRepository: AddressesRepository,
    userSettingRepository: UserSettingRepository,
    privateKeyRepository: PrivateKeyRepository
  ): Promise<PrivateKeyModel | null> {
    try {
      // Fetch all persisted states in parallel
      const [sqlMyAddresses, userSetting, storedPrivateKeys] = await Promise.all([
        addressesRepository.listMine(),
        userSettingRepository.get(),
        privateKeyRepository.list()
      ]);

      // =========================================================
      // Synchronize "mine" flags between SQLite and SecureStore
      // =========================================================

      // Wallets that actually exist in SecureStore
      const secureWalletSet = new Set(storedPrivateKeys.map(pk => pk.wallet));

      // Addresses marked as "mine" in SQLite but missing in SecureStore
      const orphanedSqlAddresses = sqlMyAddresses.filter(addr => !secureWalletSet.has(addr.address));

      // Unmark orphaned addresses (SecureStore was deleted)
      await Promise.all(
        orphanedSqlAddresses.map(addr =>
          addressesRepository.update({
            address: addr.address,
            name: addr.name,
            isMine: false
          })
        )
      );

      // =========================================================
      // Restore missing SQLite entries from SecureStore
      // =========================================================

      const sqlAddressSet = new Set(sqlMyAddresses.map(addr => addr.address));

      // Private keys that exist in SecureStore but not in SQLite
      const missingSqlAddresses = storedPrivateKeys.filter(pk => !sqlAddressSet.has(pk.wallet));

      // Recreate missing SQLite records for wallets owned by the user
      await Promise.all(
        missingSqlAddresses.map(pk =>
          addressesRepository.create({
            name: "Mine",
            address: pk.wallet,
            isMine: true
          })
        )
      );

      // =========================================================
      // Resolve default wallet & private key consistency
      // =========================================================

      let defPkResult: PrivateKeyResult | null = null;
      const configuredDefaultWallet = userSetting?.defaultWallet ?? null;

      if (configuredDefaultWallet) {
        // A default wallet is configured in SQLite
        defPkResult = storedPrivateKeys.find(pk => pk.wallet === configuredDefaultWallet) ?? null;

        // If the private key is missing from SecureStore, clear the setting
        if (!defPkResult) await userSettingRepository.patch({ defaultWallet: null });
      }

      // If no default wallet is configured but private keys exist,
      // automatically assign the first available wallet as default
      if (!configuredDefaultWallet && storedPrivateKeys.length > 0) {
        const firstKey = storedPrivateKeys[0];

        defPkResult = firstKey;
        await userSettingRepository.patch({ defaultWallet: firstKey.wallet });
      }

      const name = sqlMyAddresses.find(addr => addr.address === defPkResult?.wallet)?.name ?? "";
      return defPkResult ? privateKeyResultToDomain(name, defPkResult) : null;
    } catch (e) {
      console.error(e);
      throw new Error("アプリ起動時のウォレット初期化に失敗しました。");
    }
  }
};
