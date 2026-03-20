/**
 * Generic external API caller
 * 
 * This module provides a generic API caller for external services.
 * Now it provides a generic fetch wrapper for calling external APIs directly.
 *
 * Example usage:
 *   const result = await callExternalApi("https://api.example.com/search", {
 *     query: { q: "food" },
 *   });
 */

export type ApiCallOptions = {
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  method?: "GET" | "POST" | "PUT" | "DELETE";
};

export async function callExternalApi(
  url: string,
  options: ApiCallOptions = {}
): Promise<unknown> {
  const urlObj = new URL(url);

  // Add query parameters
  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlObj.searchParams.set(key, String(value));
      }
    });
  }

  const method = options.method || (options.body ? "POST" : "GET");

  const response = await fetch(urlObj.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `API request failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
    );
  }

  return response.json();
}
