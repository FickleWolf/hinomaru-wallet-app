import type { UserSettingRepository, UserSettingResult } from "@/application/ports/UserSettingRepository";
import type { UpdateDefaultWalletCommand, UpdateDefaultChainCommand } from "@/domain/userSetting";
import { CustomError } from "@/shared/exceptions";

export const UserSettingService = {
  async getUserSetting(userSettingRepository: UserSettingRepository): Promise<UserSettingResult> {
    try {
      const userSetting = await userSettingRepository.get();
      if (!userSetting) throw new CustomError("ユーザの設定情報の取得に失敗しました。");

      return userSetting;
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof CustomError) throw new Error(error.message);

      throw new Error(`不明なエラーによりユーザの設定情報の取得に失敗しました。`);
    }
  },

  async updateDefaultChain(
    command: UpdateDefaultChainCommand,
    userSettingRepository: UserSettingRepository
  ): Promise<void> {
    const { defaultChain } = command;

    try {
      const userSetting = await userSettingRepository.get();
      if (!userSetting) throw new CustomError("ユーザの設定情報の取得に失敗しました。");

      await userSettingRepository.patch({ defaultChain });
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof CustomError) throw new Error(error.message);

      throw new Error(`不明なエラーによりチェーンの切り替えに失敗しました。`);
    }
  },

  async updateDefaultWallet(
    command: UpdateDefaultWalletCommand,
    userSettingRepository: UserSettingRepository
  ): Promise<void> {
    const { defaultWallet } = command;

    try {
      const userSetting = await userSettingRepository.get();
      if (!userSetting) throw new CustomError("ユーザの設定情報の取得に失敗しました。");

      await userSettingRepository.patch({ defaultWallet });
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof CustomError) throw new Error(error.message);

      throw new Error(`不明なエラーによりウォレットの切り替えに失敗しました。`);
    }
  }
};
