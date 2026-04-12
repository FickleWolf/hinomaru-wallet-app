import type { WalletApiMetaSchema } from "@/shared/validations/schemas/HttpWalletMetaSchema";

import type * as v from "valibot";

export interface WalletMetaGateway {
  get(): Promise<GetWalletSummaryResult["data"]>;
}

export type GetWalletSummaryResult = v.InferOutput<typeof WalletApiMetaSchema>;
