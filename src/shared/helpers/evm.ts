import { encodeAbiParameters, encodeFunctionData, erc20Abi, keccak256 } from "viem";

import type { Address, Hex } from "viem";

type Call = Readonly<{
  to: Address;
  value: bigint;
  data: Hex;
}>;

type ExecutionIntent = Readonly<{
  chainId: number;
  sender: Address;
  calls: readonly Call[];
  expiresAtSec: bigint;
  nonce: bigint;
}>;

const CALL_TUPLE = {
  name: "calls",
  type: "tuple[]",
  components: [
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "data", type: "bytes" }
  ]
} as const;

const INTENT_TYPES = [
  { name: "chainId", type: "uint256" },
  { name: "sponsor", type: "address" },
  CALL_TUPLE,
  { name: "expiresAt", type: "uint64" },
  { name: "nonce32", type: "uint256" }
] as const;

export function erc20TransferCall(params: { token: Address; to: Address; amountMinUnits: bigint }): Call {
  return {
    to: params.token,
    value: 0n,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args: [params.to, params.amountMinUnits]
    })
  };
}

export function hashExecutionIntent(i: ExecutionIntent): Hex {
  const encoded = encodeAbiParameters(INTENT_TYPES, [BigInt(i.chainId), i.sender, i.calls, i.expiresAtSec, i.nonce]);
  return keccak256(encoded);
}
