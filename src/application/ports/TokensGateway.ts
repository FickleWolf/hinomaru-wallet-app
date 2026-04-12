import type { Chain } from "@/config/chain";
import type { TransferTokenResultSchema } from "@/shared/validations/schemas/HttpTokenResultSchema";

import type * as v from "valibot";
import type { SignAuthorizationReturnType } from "viem";

export interface TokensGateway {
  transfer(query: TransferTokenQuery): Promise<TransferTokenResult["data"]>;
}

export type TransferTokenResult = v.InferOutput<typeof TransferTokenResultSchema>;

export type TransferTokenQuery = {
  chain: Chain;
  quoteToken: string;
  authorization: SignAuthorizationReturnType;
};
