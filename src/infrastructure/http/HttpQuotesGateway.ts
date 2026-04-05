import * as v from "valibot";

import type { QuotesGateway, CreateQuoteQuery, CreateQuoteResult } from "@/application/ports/QuotesGateway";
import type { HttpClient } from "@/infrastructure/clients/HttpClient";
import { CreateQuoteResultSchema } from "@/shared/validations/schemas/HttpQuoteResultSchema";

export class HttpQuotesGateway implements QuotesGateway {
  private path = "/quotes";

  constructor(private readonly client: HttpClient) {}

  async create(query: CreateQuoteQuery): Promise<CreateQuoteResult["data"]> {
    const res = await this.client.post(this.path, query);
    const parsed = v.parse(CreateQuoteResultSchema, res);
    return parsed.data;
  }
}
