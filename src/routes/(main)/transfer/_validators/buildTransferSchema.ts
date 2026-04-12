import * as v from "valibot";

import type { Token } from "@/registries/ChainTokenRegistry";
import { TOKEN_REGISTRY } from "@/registries/ChainTokenRegistry";
import { addressFormValidator } from "@/shared/validations/forms/addressFormValidator";
import { feeTokenFormValidator } from "@/shared/validations/forms/tokenFormValidator";

export type TransferFormValues = v.InferInput<ReturnType<typeof buildTransferSchema>>;

const buildTransferSchema = (sendToken: Token, maxSendable: number, minTransfer: number) => {
  const fraction = TOKEN_REGISTRY[sendToken].supportDecimals;
  const amountPattern = new RegExp(`^\\d+(?:\\.\\d{1,${fraction}})?$`);

  return v.object({
    feeToken: feeTokenFormValidator,
    recipient: addressFormValidator,
    amount: v.pipe(
      v.string("金額を入力してください。"),
      v.transform(s => s.trim()),
      v.minLength(1, "金額を入力してください。"),
      v.regex(amountPattern, `数値で入力してください（小数は最大 ${fraction} 桁まで）。`),
      v.transform(s => Number(s)),
      v.number("金額は数値で入力してください。"),
      v.minValue(minTransfer, `最低送金可能額は ${minTransfer} ${sendToken} です。`),
      v.maxValue(maxSendable, `送金可能な残高を超えています。`)
    )
  });
};

export default buildTransferSchema;
