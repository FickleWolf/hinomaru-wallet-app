import type {
  EnablePrivateKeyCommand,
  GetPrivateKeyByWalletCommand,
  ListPrivateKeysCommand,
  PrivateKeyModel,
  StorePrivateKeyCommand
} from "@/domain/privateKey";
import { CustomError } from "@/shared/exceptions";

import { privateKeyResultToDomain } from "../mappers/privateKey";

import type { AddressesRepository } from "../ports/AddressesRepository";
import type { PrivateKeyRepository, PrivateKeyResult } from "../ports/PrivateKeyRepository";
import type { UserSettingRepository } from "../ports/UserSettingRepository";
import type { Address, Hex } from "viem";

export const PrivateKeysService = {
  async listPrivateKeys(
    command: ListPrivateKeysCommand,
    addressesRepository: AddressesRepository,
    privateKeyRepository: PrivateKeyRepository
  ): Promise<PrivateKeyModel[]> {
    const { isAuthRequired } = command;

    try {
      if (isAuthRequired) await privateKeyRepository.reload();

      const myAddresses = await addressesRepository.listMine();

      const privateKeyResult = privateKeyRepository.list();
      const domains = privateKeyResult.map(p => {
        {
          const name = myAddresses.find(a => a.address.toLowerCase() === p.wallet.toLowerCase())?.name ?? "";
          return privateKeyResultToDomain(name, p);
        }
      });
      return domains;
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof CustomError) throw new Error(error.message);

      throw new Error(`不明なエラーによりプライベートキーの取得に失敗しました。`);
    }
  },

  async getPrivateKeyByWallet(
    command: GetPrivateKeyByWalletCommand,
    addressesRepository: AddressesRepository,
    privateKeyRepository: PrivateKeyRepository
  ): Promise<PrivateKeyModel> {
    const { wallet, isAuthRequired } = command;

    try {
      if (isAuthRequired) await privateKeyRepository.reload();

      const stored = privateKeyRepository.get(wallet);
      if (!stored) throw new CustomError("指定されたウォレットに紐づくプライベートキーがありません。");

      const addr = await addressesRepository.get(stored.wallet);

      return privateKeyResultToDomain(addr?.name ?? "", stored);
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof CustomError) throw new Error(error.message);

      throw new Error(`不明なエラーによりプライベートキーの取得に失敗しました。`);
    }
  },

  async storePrivateKey(
    command: StorePrivateKeyCommand,
    addressesRepository: AddressesRepository,
    userSettingRepository: UserSettingRepository,
    privateKeyRepository: PrivateKeyRepository
  ): Promise<void> {
    const { name, wallet, privateKey, enabled } = command;
    try {
      const stored = privateKeyRepository.get(wallet);
      if (!!stored) throw new CustomError("このプライベートキーはすでに登録されています。");

      await privateKeyRepository.upsert({
        wallet: wallet.toLowerCase() as Address,
        privateKey: privateKey.toLowerCase() as Hex,
        enabled,
        createdAt: new Date().getTime()
      });

      const found = await addressesRepository.get(wallet);
      if (!!found) return;

      await addressesRepository.create({ name, address: wallet, isMine: true });

      await userSettingRepository.patch({ defaultWallet: wallet });
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof CustomError) throw new Error(error.message);

      throw new Error(`不明なエラーによりプライベートキーの作成に失敗しました。`);
    }
  },

  async enablePrivateKeyByWallet(
    command: EnablePrivateKeyCommand,
    privateKeyRepository: PrivateKeyRepository
  ): Promise<void> {
    const { wallet, segments } = command;
    try {
      const storeds = privateKeyRepository.list();
      const target = storeds.find(s => s.wallet === wallet.toLowerCase());
      if (!target) throw new CustomError("指定されたウォレットに紐づくプライベートキーがありません。");

      for (const seg of segments) {
        const { startIndex, endIndex, value } = seg;

        const expectedSlice = target.privateKey.slice(startIndex, endIndex + 1).toLowerCase();
        const actualValue = value.toLowerCase().trim();

        if (expectedSlice !== actualValue)
          throw new CustomError("プライベートキーの一部が一致しません。入力した文字列をご確認ください。");
      }

      const next: PrivateKeyResult = { ...target, enabled: true };
      await privateKeyRepository.upsert(next);
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof CustomError) throw new Error(error.message);

      throw new Error(`不明なエラーによりプライベートキーの取得に失敗しました。`);
    }
  },

  async deletePrivateKeyByWallet(
    wallet: Address,
    addressesRepository: AddressesRepository,
    userSettingRepository: UserSettingRepository,
    privateKeyRepository: PrivateKeyRepository
  ): Promise<void> {
    try {
      const userSetting = await userSettingRepository.get();
      const defaultWallet = userSetting?.defaultWallet?.toLowerCase() ?? undefined;
      if (!defaultWallet || defaultWallet === wallet.toLocaleLowerCase())
        throw new CustomError("デフォルトに設定されているウォレットを削除することはできません。");

      await privateKeyRepository.delete(wallet);

      await addressesRepository.delete(wallet);
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof CustomError) throw new Error(error.message);

      throw new Error(`不明なエラーによりプライベートキーの削除に失敗しました。`);
    }
  }
};
