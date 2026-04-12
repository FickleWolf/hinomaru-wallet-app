import type { AddressModel, MutateAddressCommand } from "@/domain/address";
import { CustomError } from "@/shared/exceptions";

import type { AddressesRepository } from "../ports/AddressesRepository";
import type { Address } from "viem";

export const AddressesService = {
  async listAddress(addressesRepository: AddressesRepository): Promise<AddressModel[]> {
    try {
      const addresses = await addressesRepository.list();
      return addresses;
    } catch {
      throw new Error("アドレス一覧の取得に失敗しました。");
    }
  },

  async listMyAddress(addressesRepository: AddressesRepository): Promise<AddressModel[]> {
    try {
      const addresses = await addressesRepository.listMine();
      return addresses;
    } catch {
      throw new Error("自分のアドレス一覧の取得に失敗しました。");
    }
  },

  async createAddress(addressesRepository: AddressesRepository, command: MutateAddressCommand): Promise<void> {
    const { address } = command;
    try {
      const found = await addressesRepository.get(address);
      if (!!found) throw new CustomError("このアドレスはすでに登録されています。");

      await addressesRepository.create({ ...command, isMine: false });
    } catch (error: unknown) {
      if (error instanceof CustomError) throw new Error(error.message);

      console.error(error);

      throw new Error(`不明なエラーによりアドレスの作成に失敗しました。`);
    }
  },

  async updateAddress(command: MutateAddressCommand, addressesRepository: AddressesRepository): Promise<void> {
    const { address } = command;
    try {
      const found = await addressesRepository.get(address);
      if (!found) throw new CustomError("指定のアドレスは登録されていません。");

      if (found.isMine && found.address !== address.toLowerCase())
        throw new CustomError("自分のアドレスを変更することはできません。");

      await addressesRepository.update({ ...command, isMine: found.isMine });
    } catch (error: unknown) {
      if (error instanceof CustomError) throw new Error(error.message);

      console.error(error);

      throw new Error("不明なエラーによりアドレスの更新に失敗しました。");
    }
  },

  async deleteAddress(addressesRepository: AddressesRepository, address: Address): Promise<void> {
    try {
      const found = await addressesRepository.get(address);
      if (!found) throw new CustomError("指定のアドレスは登録されていません。");

      if (found.isMine) throw new CustomError("自分のアドレスを削除することはできません。");

      await addressesRepository.delete(address);
    } catch (error: unknown) {
      if (error instanceof CustomError) throw new Error(error.message);

      console.error(error);

      throw new Error("不明なエラーによりアドレスの削除に失敗しました");
    }
  }
};
