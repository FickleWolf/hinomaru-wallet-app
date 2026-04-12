import type { UserSettingResult } from "@/application/ports/UserSettingRepository";
import type { UserSettingWithAddressNameRow } from "@/infrastructure/db/schema";

export const userSettingRowToResult = (dbModel: UserSettingWithAddressNameRow): UserSettingResult => {
  return {
    name: dbModel.name,
    defaultChain: dbModel.default_chain,
    defaultWallet: dbModel.default_wallet,
    updatedAt: new Date(dbModel.updated_at * 1000),
    createdAt: new Date(dbModel.created_at * 1000)
  };
};
