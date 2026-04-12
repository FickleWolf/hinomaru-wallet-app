import { ApiError } from "@/shared/exceptions";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type HttpClientConfig = {
  baseURL?: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
  fetchImpl?: typeof fetch;
};

export type RequestOptions = {
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | null | undefined>;
  signal?: AbortSignal;
  timeoutMs?: number;
  idempotencyKey?: string;
};

export class HttpClient {
  private readonly baseURL: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly defaultTimeoutMs: number | undefined;
  private readonly fetchImpl: typeof fetch;

  constructor(cfg: HttpClientConfig = {}) {
    this.baseURL = cfg.baseURL ?? "";
    this.defaultHeaders = cfg.headers ?? {};
    this.defaultTimeoutMs = cfg.timeoutMs;
    this.fetchImpl = cfg.fetchImpl ?? fetch;
  }

  // ---------- helpers ----------

  private resolveURL(path: string, query?: RequestOptions["query"]): string {
    const url = path.startsWith("http://") || path.startsWith("https://") ? path : `${this.baseURL}${path}`;

    if (!query) return url;

    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) params.set(k, String(v));
    }

    return `${url}${url.includes("?") ? "&" : "?"}${params}`;
  }

  private createAbortSignal(
    base: AbortSignal | undefined,
    timeoutMs: number | undefined
  ): { signal: AbortSignal | undefined; cleanup: () => void } {
    if (!timeoutMs) return { signal: base, cleanup: () => {} };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const onAbort = () => controller.abort();

    base?.addEventListener("abort", onAbort, { once: true });

    return {
      signal: controller.signal,
      cleanup: () => {
        clearTimeout(timer);
        base?.removeEventListener("abort", onAbort);
      }
    };
  }

  private async parseBody(res: Response): Promise<unknown> {
    const ct = res.headers.get("content-type")?.toLowerCase() ?? "";

    try {
      if (ct.includes("application/json")) return await res.json();
      if (ct.startsWith("text/")) return await res.text();
      return await res.arrayBuffer();
    } catch {
      return res.text().catch(() => undefined);
    }
  }

  private buildHeaders(opts: RequestOptions): Record<string, string> {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...this.defaultHeaders,
      ...opts.headers,
      ...(opts.idempotencyKey ? { "Idempotency-Key": opts.idempotencyKey } : {})
    };
  }

  // ---------- main request ----------

  private async request<T>(method: HttpMethod, path: string, body: unknown, opts: RequestOptions): Promise<T> {
    const url = this.resolveURL(path, opts.query);
    const headers = this.buildHeaders(opts);
    const { signal, cleanup } = this.createAbortSignal(opts.signal, opts.timeoutMs ?? this.defaultTimeoutMs);

    try {
      const res = await this.fetchImpl(url, {
        method,
        headers,
        signal,
        body:
          body !== undefined && method !== "GET" && method !== "DELETE"
            ? JSON.stringify(body, (_, v) => (typeof v === "bigint" ? v.toString() : v))
            : undefined
      });

      const data = await this.parseBody(res);

      if (!res.ok) {
        throw new ApiError({
          message: `HTTP ${res.status} ${res.statusText}`,
          status: res.status,
          method,
          url,
          body: data,
          requestId:
            res.headers.get("x-request-id") ??
            res.headers.get("x-amzn-requestid") ??
            res.headers.get("x-amz-request-id") ??
            undefined
        });
      }

      return data as T;
    } catch (e) {
      if (e instanceof ApiError) throw e;

      const isAbort = e instanceof Error && e.name === "AbortError";
      throw new ApiError({
        message: isAbort ? "Request aborted / timeout" : "Network error",
        status: 0,
        method,
        url,
        body: { cause: e instanceof Error ? e.message : String(e) }
      });
    } finally {
      cleanup();
    }
  }

  // ---------- public API ----------

  get<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
    return this.request<T>("GET", path, undefined, opts);
  }

  post<T = unknown>(path: string, body?: unknown, opts: RequestOptions = {}): Promise<T> {
    return this.request<T>("POST", path, body, opts);
  }

  put<T = unknown>(path: string, body?: unknown, opts: RequestOptions = {}): Promise<T> {
    return this.request<T>("PUT", path, body, opts);
  }

  patch<T = unknown>(path: string, body?: unknown, opts: RequestOptions = {}): Promise<T> {
    return this.request<T>("PATCH", path, body, opts);
  }

  delete<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
    return this.request<T>("DELETE", path, undefined, opts);
  }
}
