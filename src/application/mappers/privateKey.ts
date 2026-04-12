import type { PrivateKeyModel } from "@/domain/privateKey";

import type { PrivateKeyResult } from "../ports/PrivateKeyRepository";

export const privateKeyResultToDomain = (name: string, result: PrivateKeyResult): PrivateKeyModel => {
  return {
    name,
    wallet: result.wallet,
    privateKey: result.privateKey,
    enabled: result.enabled,
    createdAt: new Date(result.createdAt)
  };
};
