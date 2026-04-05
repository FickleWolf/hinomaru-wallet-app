import { endOfMonth, getUnixTime, startOfMonth, subMinutes, subYears } from "date-fns";

import type { Chain } from "@/config/chain";
import type { GetLastTransactionCommand, ListMonthlyTransactionsCommand, TransactionModel } from "@/domain/transaction";
import { SUPPORT_CHAIN_TO_TOKEN } from "@/registries/ChainTokenRegistry";
import { CustomError } from "@/shared/exceptions";

import { localTransactionToDomain, remoteToLocalTransaction } from "../mappers/transaction";

import type {
  LocalTransactionsRepository,
  LocalTransactionProgress,
  SearchLocalTransactionQuery
} from "../ports/LocalTransactionsRepository";
import type { RemoteTransactionsGateway, SearchRemoteTransactionsQuery } from "../ports/RemoteTransactionsGateway";

export const TransactionsService = {
  // TODO: Moralisに完全移行したらリモートから最新のデータを取得する
  async getLastTransaction(
    chain: Chain,
    command: GetLastTransactionCommand,
    localTransactionsRepository: LocalTransactionsRepository
  ): Promise<TransactionModel | null> {
    const { wallet } = command;

    const now = new Date();
    const query: SearchLocalTransactionQuery = {
      chain,
      tokens: [...SUPPORT_CHAIN_TO_TOKEN[chain].map(t => ({ symbol: t }))],
      wallet,
      timeFrom: subYears(now, 5),
      timeTo: subMinutes(now, 1),
      direction: "both",
      limit: 1
    };
    try {
      const searched = await localTransactionsRepository.search(query);
      if (searched.length === 0) return null;
      return localTransactionToDomain(chain, wallet, searched[0]);
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof CustomError)
        throw new Error(`最新の取引の取得に失敗しました: ${error.message}`, { cause: error });

      throw new Error(`最新の取引の取得に失敗しました（不明なエラー）: ${String(error)}`);
    }
  },

  async listMonthlyTransactionsService(
    chain: Chain,
    command: ListMonthlyTransactionsCommand,
    remoteTransactionsGateway: RemoteTransactionsGateway,
    localTransactionsRepository: LocalTransactionsRepository
  ): Promise<TransactionModel[]> {
    const { wallet, token, year, month } = command;

    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(monthStart);

    const now = new Date();
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

    try {
      const progress = await localTransactionsRepository.getProgress({
        chain,
        wallet,
        token: { symbol: token },
        year,
        month
      });

      if (!progress || progress.status !== "completed") {
        const remoteQuery: SearchRemoteTransactionsQuery = {
          chain,
          tokens: [{ symbol: token }],
          wallet,
          timestampGte: getUnixTime(monthStart),
          timestampLte: getUnixTime(monthEnd),
          direction: "both",
          limit: 10_000
        };

        const remoteTransactions = await remoteTransactionsGateway.search(remoteQuery);
        const remoteToLocalTransactions = remoteTransactions.data.map(item =>
          remoteToLocalTransaction(chain, wallet, item)
        );

        const newProgress: LocalTransactionProgress = {
          chain,
          year,
          month,
          token,
          createdBy: wallet,
          status: isCurrentMonth ? "partial" : "completed",
          lastUpdatedAt: new Date()
        };

        await localTransactionsRepository.batchWrite(newProgress, remoteToLocalTransactions);
      }

      const localTransactions = await localTransactionsRepository.search({
        chain,
        tokens: [{ symbol: token }],
        wallet,
        timeFrom: monthStart,
        timeTo: monthEnd,
        direction: "both"
      });

      const mappeds = localTransactions.map(row => localTransactionToDomain(chain, wallet, row));
      return mappeds;
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof CustomError) {
        throw new Error(`期間指定の取引一覧の取得に失敗しました: ${error.message}`, { cause: error });
      }

      throw new Error(`期間指定の取引一覧の取得に失敗しました（不明なエラー）: ${String(error)}`);
    }
  }
};
