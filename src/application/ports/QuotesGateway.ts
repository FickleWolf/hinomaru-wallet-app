import type { Chain } from "@/config/chain";
import type { Token } from "@/registries/ChainTokenRegistry";
import type { CreateQuoteResultSchema } from "@/shared/validations/schemas/HttpQuoteResultSchema";

import type * as v from "valibot";
import type { Address } from "viem";

export interface QuotesGateway {
  create(query: CreateQuoteQuery): Promise<CreateQuoteResult["data"]>;
}

export type CreateQuoteResult = v.InferOutput<typeof CreateQuoteResultSchema>;

export type CreateQuoteQuery = {
  chain: Chain;
  sender: Address;
  recipient: Address;
  token: { symbol: Token };
  feeToken: { symbol: Token };
  amountMinUnits: bigint;
};
