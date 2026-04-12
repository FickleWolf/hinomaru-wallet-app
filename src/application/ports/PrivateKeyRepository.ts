import type { Address, Hex } from "viem";

export interface PrivateKeyRepository {
  list(): PrivateKeyResult[];
  get(wallet: string): PrivateKeyResult | undefined;
  upsert(entry: PrivateKeyResult): Promise<void>;
  delete(wallet: string): Promise<void>;
  reload(): Promise<void>;
}

export type PrivateKeyResult = {
  wallet: Address;
  privateKey: Hex;
  enabled: boolean;
  createdAt: number;
};
