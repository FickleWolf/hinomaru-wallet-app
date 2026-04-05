import * as v from "valibot";

import type { Token } from "@/registries/ChainTokenRegistry";
import { TOKEN_REGISTRY } from "@/registries/ChainTokenRegistry";
import { feeTokenFormValidator } from "@/shared/validations/forms/tokenFormValidator";

export type ReceiveFormValues = v.InferInput<ReturnType<typeof buildReceiveSchema>>;

const buildReceiveSchema = (sendToken: Token, minTransfer: number) => {
  const fraction = TOKEN_REGISTRY[sendToken].supportDecimals;
  const amountPattern = new RegExp(`^\\d+(?:\\.\\d{1,${fraction}})?$`);

  return v.object({
    feeToken: feeTokenFormValidator,
    amount: v.pipe(
      v.string("金額を入力してください。"),
      v.transform(s => s.trim()),
      v.minLength(1, "金額を入力してください。"),
      v.regex(amountPattern, `数値で入力してください（小数は最大 ${fraction} 桁まで）。`),
      v.transform(s => Number(s)),
      v.number("金額は数値で入力してください。"),
      v.minValue(minTransfer, `最低請求可能額は ${minTransfer} ${sendToken} です。`)
    )
  });
};

export default buildReceiveSchema;
