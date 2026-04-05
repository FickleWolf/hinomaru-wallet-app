import type { Chain } from "@/config/chain";

import type { Address } from "viem";

export interface UserSettingRepository {
  get(): Promise<UserSettingResult | null>;
  patch(query: PatchUserSettingQuery): Promise<void>;
}

export type UserSettingResult = {
  name: string;
  defaultChain: Chain;
  defaultWallet: Address | null;
  updatedAt: Date;
  createdAt: Date;
};

export type PatchUserSettingQuery = { defaultChain?: Chain; defaultWallet?: Address | null };
