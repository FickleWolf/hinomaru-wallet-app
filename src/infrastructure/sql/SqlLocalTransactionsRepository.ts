import type {
  LocalTransactionsRepository,
  SearchLocalTransactionQuery,
  SearchLocalTransactionsResult,
  LocalTransactionProgress,
  SearchLocalTransactionItem,
  GetTransactionProgressQuery
} from "@/application/ports/LocalTransactionsRepository";
import { chunk, withBusyRetry, execWithRetry } from "@/infrastructure/db/libs";
import type { TransactionProgressRow, TransactionWithAddressRow } from "@/infrastructure/db/schema";
import { TOKEN_REGISTRY } from "@/registries/ChainTokenRegistry";
import { CustomError } from "@/shared/exceptions";

import { transactionProgressRowToResult, transactionWithAddressRowToResult } from "../mappers/transactionRowToResult";

import type { SQLiteDatabase } from "expo-sqlite";

export class SqlLocalTransactionsRepository implements LocalTransactionsRepository {
  private db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  async search(query: SearchLocalTransactionQuery): Promise<SearchLocalTransactionsResult[]> {
    const { chain, wallet, tokens, timeFrom, timeTo, limit, direction } = query;

    const tokenAddrs = tokens
      .map(({ symbol }) => TOKEN_REGISTRY[symbol].address[chain]?.toLowerCase())
      .filter((addr): addr is string => Boolean(addr));
    const inPlaceholders = tokenAddrs.map((_, i) => `$t${i}`).join(",");

    const cond: string[] = [`t.token_address IN (${inPlaceholders})`];
    const bind: Record<string, string | number> = {};
    tokenAddrs.forEach((a, i) => (bind[`$t${i}`] = a));

    cond.push(`t.chain = $chain`);
    bind.$chain = chain;

    if (timeFrom) {
      cond.push(`t.transferred_at >= $from`);
      bind.$from = Math.floor(timeFrom.getTime() / 1000);
    }
    if (timeTo) {
      cond.push(`t.transferred_at <= $to`);
      bind.$to = Math.floor(timeTo.getTime() / 1000);
    }

    const me = wallet.toLowerCase();
    if (direction === "in") cond.push(`t.to_address = $me`);

    if (direction === "out") cond.push(`t.from_address = $me`);

    if (direction === "both") cond.push(`(t.from_address = $me OR t.to_address = $me)`);

    if (direction && direction !== "both") bind.$me = me;

    if (direction === "both") bind.$me = me;

    const limitSql = limit ? `LIMIT $limit` : "";
    if (limit) bind.$limit = limit;

    const stmt = await this.db.prepareAsync(`
      SELECT t.tx_hash,
            t.log_index,
            t.block_number,
            t.token_address,
            t.from_address,
            t.to_address,
            t.value_min_units,
            t.transferred_at,
            fa.name AS from_name,
            ta.name AS to_name
      FROM transactions AS t
        LEFT JOIN addresses AS fa ON fa.address = t.from_address
        LEFT JOIN addresses AS ta ON ta.address = t.to_address
      WHERE ${cond.join(" AND ")}
      ORDER BY t.transferred_at DESC, CAST(t.block_number AS INTEGER) DESC, t.log_index DESC
      ${limitSql};
    `);
    try {
      const res = await stmt.executeAsync<TransactionWithAddressRow>(bind);
      const rows = await res.getAllAsync();
      return rows.map(transactionWithAddressRowToResult);
    } finally {
      await stmt.finalizeAsync();
    }
  }

  async batchWrite(progress: LocalTransactionProgress, items: SearchLocalTransactionItem[]): Promise<void> {
    const { chain, year, month, status, token, createdBy, lastUpdatedAt } = progress;
    const registryTokenAddress = TOKEN_REGISTRY[token].address[chain];

    if (!registryTokenAddress)
      throw new CustomError(
        `Token "${token}" is not configured for chain "${chain}" in TOKEN_REGISTRY. Unable to resolve token address.`
      );

    const walletAddress = createdBy.toLowerCase();

    for (const part of chunk(items, 300)) {
      await withBusyRetry(async () => {
        await this.db.withExclusiveTransactionAsync(async txn => {
          const txStmt = await txn.prepareAsync(`
          INSERT OR IGNORE INTO transactions (
            chain, tx_hash, log_index, block_number,
            token_address, from_address, to_address,
            value_min_units, transferred_at
          )
          VALUES (
            $chain, $txHash, $logIndex, $blockNumber,
            $tokenAddress, $fromAddress, $toAddress,
            $valueMinUnits, $transferredAt
          )
        `);
          try {
            for (const r of part) {
              await execWithRetry(() =>
                txStmt.executeAsync({
                  $chain: chain,
                  $txHash: r.txHash.toLowerCase(),
                  $logIndex: r.logIndex,
                  $blockNumber: String(r.blockNumber),
                  $tokenAddress: r.tokenAddress.toLowerCase(),
                  $fromAddress: r.fromAddress.toLowerCase(),
                  $toAddress: r.toAddress.toLowerCase(),
                  $valueMinUnits: String(r.valueMinUnits),
                  $transferredAt: r.transferredUnixAt
                })
              );
            }
          } finally {
            await txStmt.finalizeAsync();
          }
        });
      });
    }

    await withBusyRetry(async () => {
      await this.db.withExclusiveTransactionAsync(async txn => {
        const progStmt = await txn.prepareAsync(`
        INSERT INTO transaction_progress (
          chain, year, month, token_address, created_by_address, status, last_updated_at
        ) VALUES (
          $chain, $year, $month, $tokenAddress, $createdBy, $status, $lastUpdatedAt
        )
        ON CONFLICT(chain, year, month, token_address, created_by_address)
        DO UPDATE SET status=excluded.status, last_updated_at=excluded.last_updated_at
      `);

        try {
          await execWithRetry(() =>
            progStmt.executeAsync({
              $chain: chain,
              $year: year,
              $month: month,
              $tokenAddress: registryTokenAddress.toLowerCase(),
              $createdBy: walletAddress,
              $status: status,
              $lastUpdatedAt: Math.floor(lastUpdatedAt.getTime() / 1000) // Date → unix(sec)
            })
          );
        } finally {
          await progStmt.finalizeAsync();
        }
      });
    });
  }

  async getProgress(query: GetTransactionProgressQuery): Promise<LocalTransactionProgress | null> {
    const { chain, wallet, year, month, token } = query;
    const tokenAddress = TOKEN_REGISTRY[token.symbol].address[chain];

    if (!tokenAddress)
      throw new CustomError(
        `Token "${token.symbol}" is not configured for chain "${chain}" in TOKEN_REGISTRY. Unable to resolve token address.`
      );

    const stmt = await this.db.prepareAsync(`
      SELECT
        chain,
        year,
        month,
        token_address,
        created_by_address,
        status,
        last_updated_at
      FROM transaction_progress
      WHERE
        chain = $chain
        AND year = $year
        AND month = $month
        AND token_address = $tokenAddress
        AND created_by_address = $createdBy
    `);

    try {
      const result = await stmt.executeAsync<TransactionProgressRow>({
        $chain: chain,
        $year: year,
        $month: month,
        $tokenAddress: tokenAddress.toLowerCase(),
        $createdBy: wallet.toLowerCase()
      });
      const row = await result.getFirstAsync();
      if (!row) return null;
      return transactionProgressRowToResult(chain, row);
    } finally {
      await stmt.finalizeAsync();
    }
  }
}
