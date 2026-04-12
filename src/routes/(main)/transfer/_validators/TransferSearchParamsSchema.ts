import * as v from "valibot";

import type { Chain } from "@/config/chain";
import { addressFormValidator } from "@/shared/validations/forms/addressFormValidator";
import { chainValidator } from "@/shared/validations/forms/chainValidator";
import { feeTokenFormValidator, sendTokenFormValidator } from "@/shared/validations/forms/tokenFormValidator";

export type TransferSearchParams = v.InferInput<typeof TransferSearchParamsSchema>;

export type ParsedTransferSearchParams = {
  chain: Chain;
  feeToken: string;
  amount: string;
  recipient: string;
};

const TransferSearchParamsSchema = v.object({
  chain: v.optional(chainValidator),
  sendToken: v.optional(sendTokenFormValidator),
  feeToken: v.optional(feeTokenFormValidator),
  recipient: v.optional(addressFormValidator),
  amount: v.optional(
    v.pipe(
      v.string("文字列で入力してください。"),
      v.nonEmpty("金額を入力してください。"),
      v.regex(/^\d+(?:\.\d+)?$/, "金額は半角数字（小数可）で入力してください。")
    )
  )
});

export default TransferSearchParamsSchema;
