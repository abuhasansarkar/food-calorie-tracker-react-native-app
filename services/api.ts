import { Config } from "@/constants/Config";
import { ApiResponse, PaginatedResponse } from "@/types/api";

class ApiService {
  private baseUrl: string;
  private timeout: number;
  private retries: number;
  private token: string | null = null;

  constructor() {
    this.baseUrl = Config.api.baseUrl;
    this.timeout = Config.api.timeout;
    this.retries = Config.api.retries;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt = 0
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      };

      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.code || "UNKNOWN_ERROR",
            message: data.message || "An unexpected error occurred",
            details: data.details,
          },
        };
      }

      return { success: true, data: data as T };
    } catch (error) {
      clearTimeout(timeoutId);

      if (attempt < this.retries) {
        return this.request<T>(endpoint, options, attempt + 1);
      }

      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message:
            error instanceof Error ? error.message : "Network request failed",
        },
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async getPaginated<T>(
    endpoint: string,
    offset = 0,
    limit = Config.pagination.defaultLimit
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
    });
    return this.get<PaginatedResponse<T>>(`${endpoint}?${params.toString()}`);
  }
}

export const apiService = new ApiService();
