import * as v from "valibot";

import { hex64Validator } from "../rules/addressValidator";

export const TransferTokenResultSchema = v.object({
  data: v.object(
    {
      status: v.picklist(["submitted"], "status must be one of: submitted"),
      txHash: hex64Validator("txHash")
    },
    issue => `${String(issue.expected)} is required`
  )
});
