import * as v from "valibot";

import { CHAIN_KEYS } from "@/config/chain";

export const feesPolicyValidator = v.object(
  {
    method: v.string("policy.method must be a string."),
    version: v.string("policy.version must be a string."),
    chainKey: v.picklist(CHAIN_KEYS, `policy.chain must be one of ${CHAIN_KEYS.join(", ")}`)
  },
  issue => `${String(issue.expected)} is required`
);
