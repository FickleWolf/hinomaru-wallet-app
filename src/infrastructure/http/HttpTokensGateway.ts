import * as v from "valibot";

import type { TokensGateway, TransferTokenQuery, TransferTokenResult } from "@/application/ports/TokensGateway";
import type { HttpClient } from "@/infrastructure/clients/HttpClient";
import { TransferTokenResultSchema } from "@/shared/validations/schemas/HttpTokenResultSchema";

export class HttpTokensGateway implements TokensGateway {
  private readonly path = "/tokens";

  constructor(private readonly client: HttpClient) {}

  async transfer(query: TransferTokenQuery): Promise<TransferTokenResult["data"]> {
    const res = await this.client.post(`${this.path}:transfer`, query);
    const parsed = v.parse(TransferTokenResultSchema, res);
    return parsed.data;
  }
}
