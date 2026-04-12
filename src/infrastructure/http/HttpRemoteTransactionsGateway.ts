import * as v from "valibot";

import type {
  RemoteTransactionsGateway,
  SearchRemoteTransactionsQuery,
  SearchRemoteTransactionsResult
} from "@/application/ports/RemoteTransactionsGateway";
import { SearchRemoteTransactionsResultSchema } from "@/shared/validations/schemas/HttpRemoteTransactionsResultSchema";

import type { HttpClient } from "../clients/HttpClient";

export class HttpRemoteTransactionsGateway implements RemoteTransactionsGateway {
  private path = "/transactions";

  constructor(private readonly client: HttpClient) {}

  async search(query: SearchRemoteTransactionsQuery): Promise<SearchRemoteTransactionsResult> {
    const res = await this.client.post(`${this.path}:search`, query);
    const parsed = v.parse(SearchRemoteTransactionsResultSchema, res);
    return parsed;
  }
}
