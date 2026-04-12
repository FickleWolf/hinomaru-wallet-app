import type {
  UserSettingRepository,
  UserSettingResult,
  PatchUserSettingQuery
} from "@/application/ports/UserSettingRepository";
import type { UserSettingWithAddressNameRow } from "@/infrastructure/db/schema";

import { userSettingRowToResult } from "../mappers/userSettingRowToResult";

import type { SQLiteDatabase } from "expo-sqlite";

export class SqlUserSettingRepository implements UserSettingRepository {
  private db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  async get(): Promise<UserSettingResult | null> {
    const stmt = await this.db.prepareAsync(`
      SELECT
        a.name AS name,
        us.default_chain AS default_chain,
        us.default_wallet AS default_wallet,
        us.updated_at AS updated_at,
        us.created_at AS created_at
      FROM user_setting AS us
      LEFT JOIN addresses AS a
        ON a.address = us.default_wallet
      WHERE us.id = 1
      LIMIT 1
    `);
    try {
      const result = await stmt.executeAsync<UserSettingWithAddressNameRow>();
      const row = await result.getFirstAsync();
      if (!row) return null;
      return userSettingRowToResult(row);
    } finally {
      await stmt.finalizeAsync();
    }
  }

  async patch(query: PatchUserSettingQuery): Promise<void> {
    const { defaultChain, defaultWallet } = query;

    let setClauses = ["updated_at = strftime('%s','now')"];
    const params: Record<string, string | null> = {};

    if (defaultChain !== undefined) {
      setClauses.push("default_chain = $defaultChain");
      params.$defaultChain = defaultChain;
    }
    if (defaultWallet !== undefined) {
      setClauses.push("default_wallet = $defaultWallet");
      params.$defaultWallet = defaultWallet ? defaultWallet.toLowerCase() : null;
    }

    const stmt = await this.db.prepareAsync(`
      UPDATE user_setting
      SET ${setClauses.join(", ")}
      WHERE id = 1
    `);

    try {
      await stmt.executeAsync(params);
    } finally {
      await stmt.finalizeAsync();
    }
  }
}
