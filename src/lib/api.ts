async function requestJson<TResponse>(url: string, method: string, body?: unknown): Promise<TResponse> {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Something went wrong.");
  }

  if (res.status === 204) return undefined as TResponse;
  return res.json();
}

export function postJson<TResponse>(url: string, body: unknown): Promise<TResponse> {
  return requestJson<TResponse>(url, "POST", body);
}

export function patchJson<TResponse>(url: string, body: unknown): Promise<TResponse> {
  return requestJson<TResponse>(url, "PATCH", body);
}

export function deleteJson<TResponse>(url: string): Promise<TResponse> {
  return requestJson<TResponse>(url, "DELETE");
}
