import type {
  AddressesRepository,
  AddressesResult,
  CreateAddressQuery,
  UpdateAddressQuery
} from "@/application/ports/AddressesRepository";
import type { AddressRow } from "@/infrastructure/db/schema";

import { addressRowToResult } from "../mappers/addressRowToResult";

import type { SQLiteDatabase } from "expo-sqlite";
import type { Address } from "viem";

export class SqlAddressesRepository implements AddressesRepository {
  private db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  async get(address: Address): Promise<AddressesResult | null> {
    const stmt = await this.db.prepareAsync(`
      SELECT *
      FROM addresses
      WHERE address = $address
    `);
    try {
      const result = await stmt.executeAsync<AddressRow>({ $address: address.toLowerCase() });
      const row = await result.getFirstAsync();
      if (!row) return null;
      return addressRowToResult(row);
    } finally {
      await stmt.finalizeAsync();
    }
  }

  async list(): Promise<AddressesResult[]> {
    const stmt = await this.db.prepareAsync(`
      SELECT *
      FROM addresses
      ORDER BY
        is_mine DESC,
        name COLLATE NOCASE,
        address
    `);
    try {
      const result = await stmt.executeAsync<AddressRow>();
      const rows = await result.getAllAsync();
      return rows.map(addressRowToResult);
    } finally {
      await stmt.finalizeAsync();
    }
  }

  async listMine(): Promise<AddressesResult[]> {
    const stmt = await this.db.prepareAsync(`
      SELECT *
      FROM addresses
      WHERE is_mine = 1
      ORDER BY
        name COLLATE NOCASE,
        address
    `);
    try {
      const result = await stmt.executeAsync<AddressRow>();
      const rows = await result.getAllAsync();
      return rows.map(addressRowToResult);
    } finally {
      await stmt.finalizeAsync();
    }
  }

  async create(query: CreateAddressQuery): Promise<void> {
    const { address, name, isMine } = query;
    const stmt = await this.db.prepareAsync(`
      INSERT INTO addresses(address, name, is_mine)
      VALUES ($address, $name, $isMine)
    `);
    try {
      await stmt.executeAsync({ $address: address.toLowerCase(), $name: name, $isMine: isMine ? 1 : 0 });
    } finally {
      await stmt.finalizeAsync();
    }
  }

  async update(query: UpdateAddressQuery): Promise<void> {
    const { address, name, isMine } = query;
    const stmt = await this.db.prepareAsync(`
      UPDATE addresses
      SET name = $name, is_mine = $isMine, updated_at = strftime('%s','now')
      WHERE address = $address
    `);
    try {
      await stmt.executeAsync({ $address: address.toLowerCase(), $name: name, $isMine: isMine });
    } finally {
      await stmt.finalizeAsync();
    }
  }

  async delete(address: Address): Promise<void> {
    const stmt = await this.db.prepareAsync(`
      DELETE FROM addresses
      WHERE address = $address
    `);
    try {
      await stmt.executeAsync({ $address: address.toLowerCase() });
    } finally {
      await stmt.finalizeAsync();
    }
  }
}
