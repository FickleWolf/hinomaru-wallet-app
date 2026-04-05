import * as v from "valibot";

import { addressValidator } from "@/shared/validations/rules/addressValidator";

// Chains
const chainsMetaShape = v.array(
  v.object(
    {
      key: v.string("chains[].key is required"),
      id: v.number("chains[].id must be a number"),
      testnet: v.boolean("chains[].testnet must be a boolean")
    },
    issue => `${issue.path?.join(".")} is required`
  ),
  "chains must be an array"
);

// Tokens
const tokensMetaSchema = v.array(
  v.object(
    {
      symbol: v.string("tokens[].symbol is required"),
      address: v.record(v.string("token chainSymbol must be a string"), addressValidator("tokens[].address[...]")),
      decimals: v.number("tokens[].decimals must be a number")
    },
    issue => `${issue.path?.join(".")} is required`
  ),
  "tokens must be an array"
);

// Fixed Fees
const fixedFeesMetaShape = v.array(
  v.object(
    {
      chainKey: v.string("fixedFees[].chainKey is required"),
      tokenSymbol: v.string("fixedFees[].tokenSymbol is required"),
      fixedFeeAmountUnits: v.string("fixedFees[].fixedFeeAmountUnits must be a string"),
      fixedFeeAmountDisplay: v.number("fixedFees[].fixedFeeAmountDisplay must be a number")
    },
    issue => `${issue.path?.join(".")} is required`
  ),
  "fixedFees must be an array"
);

// Minimum Transfers
const minTransfersMetaShape = v.array(
  v.object(
    {
      chainKey: v.string("minTransfers[].chainKey is required"),
      tokenSymbol: v.string("minTransfers[].tokenSymbol is required"),
      minTransferAmountUnits: v.string("minTransfers[].minTransferAmountUnits must be a string"),
      minTransferAmountDisplay: v.number("minTransfers[].minTransferAmountDisplay must be a number")
    },
    issue => `${issue.path?.join(".")} is required`
  ),
  "minTransfers must be an array"
);

// Contract Addresses
const contractsMetaShape = v.object(
  {
    sponsor: v.record(
      v.string("sponsor chainKey must be a string"),
      addressValidator("contracts.sponsor[...] is not a valid address")
    ),
    delegate: v.record(
      v.string("delegate chainKey must be a string"),
      addressValidator("contracts.delegate[...] is not a valid address")
    ),
    registry: v.record(
      v.string("registry chainKey must be a string"),
      addressValidator("contracts.registry[...] is not a valid address")
    )
  },
  issue => `${issue.path?.join(".")} is required`
);

// Full Meta Schema
export const WalletApiMetaSchema = v.object({
  data: v.object(
    {
      schemaVersion: v.string("schemaVersion must be string"),
      chains: chainsMetaShape,
      tokens: tokensMetaSchema,
      fixedFees: fixedFeesMetaShape,
      minTransfers: minTransfersMetaShape,
      contracts: contractsMetaShape
    },
    issue => `Invalid meta schema: ${issue.path?.join(".") ?? "unknown field"} is required`
  )
});
