import type { Chain } from "@/config/chain";
import type { TransactionModel } from "@/domain/transaction";
import { ADDRESS_TO_TOKEN, TOKEN_REGISTRY } from "@/registries/ChainTokenRegistry";
import { CustomError } from "@/shared/exceptions";
import { toDisplyValue } from "@/shared/helpers/tokenUnits";

import type { SearchLocalTransactionItem, SearchLocalTransactionsResult } from "../ports/LocalTransactionsRepository";
import type { SearchRemoteTransactionItem } from "../ports/RemoteTransactionsGateway";
import type { Address } from "viem";

export const remoteTransactionToDomain = (item: SearchRemoteTransactionItem): TransactionModel => {
  return {
    txHash: item.txHash,
    blockNumber: item.blockNumber,
    logIndex: item.logIndex,
    token: item.token.symbol,
    direction: item.direction,
    value: {
      minUnits: item.value.minUnits,
      displyValue: toDisplyValue(item.value.minUnits, item.token.symbol)
    },
    counterparty: item.counterparty,
    transferredAt: item.transferredAt
  };
};

export const localTransactionToDomain = (
  chain: Chain,
  wallet: Address,
  result: SearchLocalTransactionsResult
): TransactionModel => {
  const token = ADDRESS_TO_TOKEN[chain][result.tokenAddress.toLowerCase() as Address];
  if (!token)
    throw new CustomError(
      `Unsupported token address detected for chain "${chain}": ${result.tokenAddress}. The token is not registered in ADDRESS_TO_TOKEN and cannot be processed.`
    );

  const {
    direction,
    counterparty
  }: {
    direction: TransactionModel["direction"];
    counterparty: { address: Address; name?: string };
  } = (() => {
    const me = wallet.toLowerCase();
    const from = result.fromAddress.toLowerCase();
    const to = result.toAddress.toLowerCase();

    if (from === me && to !== me)
      return { direction: "out", counterparty: { address: result.toAddress, name: result.toName } };

    if (from !== me && to === me)
      return { direction: "in", counterparty: { address: result.fromAddress, name: result.fromName } };

    return { direction: "self", counterparty: { address: wallet, name: result.toName } };
  })();

  return {
    txHash: result.txHash,
    blockNumber: result.blockNumber,
    logIndex: result.logIndex,
    token,
    direction,
    value: {
      minUnits: result.valueMinUnits,
      displyValue: toDisplyValue(result.valueMinUnits, token)
    },
    counterparty,
    transferredAt: new Date(result.transferredUnixAt * 1000)
  };
};

export const remoteToLocalTransaction = (
  chain: Chain,
  wallet: Address,
  item: SearchRemoteTransactionItem
): SearchLocalTransactionItem => {
  const tokenMeta = TOKEN_REGISTRY[item.token.symbol];

  const tokenAddress = tokenMeta.address[chain];
  if (!tokenAddress)
    throw new CustomError(
      `Token "${item.token.symbol}" is not configured for chain "${chain}" in TOKEN_REGISTRY. Unable to resolve token address.`
    );

  let fromAddress: Address;
  let toAddress: Address;

  switch (item.direction) {
    case "in":
      fromAddress = item.counterparty.address;
      toAddress = wallet;
      break;
    case "out":
      fromAddress = wallet;
      toAddress = item.counterparty.address;
      break;
    case "self":
      fromAddress = wallet;
      toAddress = wallet;
      break;
    default: {
      const _exhaustive: never = item.direction;
      throw new Error(`Unexpected direction: ${_exhaustive}`);
    }
  }

  return {
    txHash: item.txHash,
    blockNumber: item.blockNumber,
    logIndex: item.logIndex,
    tokenAddress,
    fromAddress,
    toAddress,
    valueMinUnits: item.value.minUnits,
    transferredUnixAt: Math.floor(item.transferredAt.getTime() / 1000)
  };
};
