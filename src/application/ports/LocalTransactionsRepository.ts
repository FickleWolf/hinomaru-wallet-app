import type { Chain } from "@/config/chain";
import type { Token } from "@/registries/ChainTokenRegistry";

import type { Address, Hex } from "viem";

export interface LocalTransactionsRepository {
  search(query: SearchLocalTransactionQuery): Promise<SearchLocalTransactionsResult[]>;
  batchWrite(progress: LocalTransactionProgress, items: SearchLocalTransactionItem[]): Promise<void>;
  getProgress(query: GetTransactionProgressQuery): Promise<LocalTransactionProgress | null>;
}

export type SearchLocalTransactionItem = {
  txHash: Hex;
  blockNumber: bigint;
  logIndex: number;
  tokenAddress: Address;
  fromAddress: Address;
  toAddress: Address;
  valueMinUnits: bigint;
  transferredUnixAt: number;
};

export type SearchLocalTransactionsResult = SearchLocalTransactionItem & {
  fromName?: string;
  toName?: string;
};

export type LocalTransactionProgress = {
  chain: Chain;
  year: number;
  month: number;
  token: Token;
  createdBy: Address;
  status: "completed" | "partial";
  lastUpdatedAt: Date;
};

export type SearchLocalTransactionQuery = {
  chain: Chain;
  tokens: { symbol: Token }[];
  wallet: Address;
  timeFrom: Date;
  timeTo: Date;
  direction: "in" | "out" | "both";
  limit?: number;
};

export type GetTransactionProgressQuery = {
  chain: Chain;
  wallet: Address;
  year: number;
  month: number;
  token: { symbol: Token };
};
