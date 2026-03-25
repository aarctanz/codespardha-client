const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const { headers: extraHeaders, ...rest } = options ?? {};
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(extraHeaders as Record<string, string>),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(
      res.status,
      body?.error ?? `API error ${res.status}: ${res.statusText}`,
    );
  }

  return res.json();
}
