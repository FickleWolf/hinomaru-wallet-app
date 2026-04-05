import * as v from "valibot";

import { addressValidator, hex64Validator } from "../rules/addressValidator";
import { amountUnitValidator } from "../rules/amountUnitValidator";
import { isoDateValidator } from "../rules/isoDateValidator";
import { stringBigintValidator } from "../rules/stringBigintValidator";
import { tokenMetaValidator } from "../rules/tokenMetaValidator";

const SearchRemoteTransactionItemSchema = v.object(
  {
    txHash: hex64Validator("txHash"),
    blockNumber: stringBigintValidator("blockNumber"),
    logIndex: v.number("logIndex must be a number"),
    token: tokenMetaValidator("token"),
    direction: v.picklist(["in", "out", "self"], "direction must be one of 'in', 'out' or 'self'"),
    value: amountUnitValidator("amount"),
    counterparty: v.object(
      {
        address: addressValidator("counterparty.address")
      },
      issue => `counterparty.${String(issue.expected)} is required`
    ),
    transferredAt: isoDateValidator("transferredAt")
  },
  issue => `items[i].${String(issue.expected)} is required`
);

export const SearchRemoteTransactionsResultSchema = v.object(
  {
    data: v.array(SearchRemoteTransactionItemSchema, "items must be an array"),
    meta: v.object({ count: v.number("count must be a number") })
  },
  issue => `${String(issue.expected)} is required`
);
