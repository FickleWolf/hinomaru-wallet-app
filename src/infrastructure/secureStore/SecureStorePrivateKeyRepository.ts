import * as SecureStore from "expo-secure-store";

import type { PrivateKeyRepository, PrivateKeyResult } from "@/application/ports/PrivateKeyRepository";
import { ENV } from "@/config/env";
import { CustomError } from "@/shared/exceptions";

import type { Address, Hex } from "viem";

const STORAGE_KEY = ENV.SECURESTORE_WALLET_KEY;

export class SecureStorePrivateKeyRepository implements PrivateKeyRepository {
  private static instance: PrivateKeyRepository | null = null;
  private static ready: Promise<PrivateKeyRepository> | null = null;

  private items: PrivateKeyResult[] = [];

  private constructor() {}

  static async getInstance(): Promise<PrivateKeyRepository> {
    if (this.instance) return this.instance;

    if (!this.ready) {
      this.ready = (async () => {
        try {
          const inst = new SecureStorePrivateKeyRepository();
          await inst.load();
          this.instance = inst;
          return inst;
        } catch (e) {
          this.ready = null;
          throw new CustomError("セキュアストアの読み込みに失敗しました。", { cause: e });
        }
      })();
    }
    return await this.ready;
  }

  // ---- Persistence ----
  private async load(): Promise<void> {
    try {
      const stored = await SecureStore.getItemAsync(STORAGE_KEY, { requireAuthentication: true });
      if (!stored) {
        this.items = [];
        return;
      }
      const parsed = JSON.parse(stored) as unknown;
      const asserted = Array.isArray(parsed) ? (parsed as PrivateKeyResult[]) : [];
      this.items = asserted.map(i => ({
        wallet: i.wallet.toLowerCase() as Address,
        privateKey: i.privateKey.toLowerCase() as Hex,
        enabled: !!i.enabled,
        createdAt: i.createdAt
      }));
    } catch (e) {
      throw new CustomError("セキュアストアにアクセスできませんでした。", { cause: e });
    }
  }

  private async persist(): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(this.items), { requireAuthentication: true });
    } catch (e) {
      throw new CustomError("セキュアストアにアクセスできませんでした。", { cause: e });
    }
  }

  // ---- CRUD ----
  list(): PrivateKeyResult[] {
    return [...this.items];
  }

  get(wallet: string): PrivateKeyResult | undefined {
    const key = wallet.toLowerCase();
    return this.items.find(it => it.wallet.toLowerCase() === key);
  }

  async upsert(entry: PrivateKeyResult): Promise<void> {
    const key = entry.wallet.toLowerCase();
    const idx = this.items.findIndex(it => it.wallet.toLowerCase() === key);

    const snapshot = [...this.items];

    if (idx >= 0) this.items[idx] = entry;
    else this.items.push(entry);

    try {
      await this.persist();
    } catch (e) {
      this.items = snapshot;
      throw e;
    }
  }

  async delete(wallet: string): Promise<void> {
    const key = wallet.toLowerCase();
    const snapshot = [...this.items];

    const next = this.items.filter(it => it.wallet.toLowerCase() !== key);

    if (next.length === this.items.length) return;

    this.items = next;

    try {
      await this.persist();
    } catch (e) {
      this.items = snapshot;
      throw e;
    }
  }

  async reload(): Promise<void> {
    await this.load();
  }
}
