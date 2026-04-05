import * as v from "valibot";

import type { GetWalletSummaryResult, WalletMetaGateway } from "@/application/ports/WalletMetaGateway";
import { WalletApiMetaSchema } from "@/shared/validations/schemas/HttpWalletMetaSchema";

import type { HttpClient } from "../clients/HttpClient";

export class HttpWalletMetaGateway implements WalletMetaGateway {
  private readonly path = "/meta";

  constructor(private readonly client: HttpClient) {}

  async get(): Promise<GetWalletSummaryResult["data"]> {
    const res = await this.client.get(`${this.path}/summary`);
    const parsed = v.parse(WalletApiMetaSchema, res);
    return parsed.data;
  }
}
