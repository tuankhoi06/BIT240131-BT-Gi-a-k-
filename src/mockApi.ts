import { ApiRecord, Category, Dish } from "./types";

const BASE_URL = (process.env.EXPO_PUBLIC_MOCKAPI_BASE_URL ?? "").replace(
  /\/+$/,
  "",
);

export const apiConfigured = (): boolean =>
  BASE_URL.startsWith("https://") && !BASE_URL.includes("YOUR_PROJECT_ID");

function resourceUrl(resource: string): string {
  if (!apiConfigured()) {
    throw new Error("MockAPI URL is not configured.");
  }
  return `${BASE_URL}/${resource}`;
}

async function request<T>(
  url: string,
  init?: RequestInit,
  allowNotFound = false,
): Promise<T | undefined> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (allowNotFound && response.status === 404) {
    return undefined;
  }
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `MockAPI request failed (${response.status} ${response.statusText}): ${body}`,
    );
  }
  if (response.status === 204) {
    return undefined;
  }
  return (await response.json()) as T;
}

export async function fetchRecords<T extends Category | Dish>(
  resource: string,
): Promise<Array<ApiRecord<T>>> {
  const result = await request<Array<ApiRecord<T>>>(resourceUrl(resource));
  if (!Array.isArray(result)) {
    throw new Error(`MockAPI returned an invalid ${resource} list.`);
  }
  return result;
}

export async function findByClientId<T extends Category | Dish>(
  resource: string,
  clientId: string,
): Promise<ApiRecord<T> | undefined> {
  const records = await fetchRecords<T>(resource);
  return records.find((record) => record.BIT240131_ClientId === clientId);
}

export async function saveRecord<T extends Category | Dish>(
  resource: string,
  apiId: string | undefined,
  value: T,
): Promise<ApiRecord<T>> {
  const payload = { ...value } as T & { BIT240131_ApiId?: string };
  delete payload.BIT240131_ApiId;
  const result = await request<ApiRecord<T>>(
    apiId
      ? `${resourceUrl(resource)}/${encodeURIComponent(apiId)}`
      : resourceUrl(resource),
    {
      method: apiId ? "PUT" : "POST",
      body: JSON.stringify(payload),
    },
  );
  if (!result?.id) {
    throw new Error(`MockAPI did not return an id for ${resource}.`);
  }
  return result;
}

export async function deleteRecord(
  resource: string,
  apiId: string,
): Promise<void> {
  await request<void>(
    `${resourceUrl(resource)}/${encodeURIComponent(apiId)}`,
    { method: "DELETE" },
    true,
  );
}
