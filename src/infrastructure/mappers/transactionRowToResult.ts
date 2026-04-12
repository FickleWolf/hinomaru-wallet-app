import type {
  LocalTransactionProgress,
  SearchLocalTransactionsResult
} from "@/application/ports/LocalTransactionsRepository";
import type { Chain } from "@/config/chain";
import type { TransactionProgressRow, TransactionWithAddressRow } from "@/infrastructure/db/schema";
import { ADDRESS_TO_TOKEN } from "@/registries/ChainTokenRegistry";
import { CustomError } from "@/shared/exceptions";

import type { Address } from "viem";

export const transactionWithAddressRowToResult = (
  dbModel: TransactionWithAddressRow
): SearchLocalTransactionsResult => {
  return {
    txHash: dbModel.tx_hash,
    blockNumber: BigInt(dbModel.block_number),
    logIndex: dbModel.log_index,
    tokenAddress: dbModel.token_address,
    fromAddress: dbModel.from_address,
    toAddress: dbModel.to_address,
    valueMinUnits: BigInt(dbModel.value_min_units),
    transferredUnixAt: dbModel.transferred_at,
    fromName: dbModel.from_name ?? undefined,
    toName: dbModel.to_name ?? undefined
  };
};

export const transactionProgressRowToResult = (
  chain: Chain,
  dbModel: TransactionProgressRow
): LocalTransactionProgress => {
  const token = ADDRESS_TO_TOKEN[chain][dbModel.token_address.toLowerCase() as Address];

  if (!token)
    throw new CustomError(
      `Unsupported token address detected for chain "${chain}": ${dbModel.token_address}. The token is not registered in ADDRESS_TO_TOKEN and cannot be processed.`
    );

  return {
    chain: dbModel.chain,
    year: dbModel.year,
    month: dbModel.month,
    token,
    createdBy: dbModel.created_by_address,
    status: dbModel.status,
    lastUpdatedAt: new Date(dbModel.last_updated_at * 1000)
  };
};
