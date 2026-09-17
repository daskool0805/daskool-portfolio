const projectId = process.env.SANITY_PROJECT_ID || "rk9s9iog";
const dataset = process.env.SANITY_DATASET || "production";
const apiVersion = "2026-09-01";

export async function sanityQuery(query, params = {}, token = "", perspective = "published") {
  if (!projectId) throw new Error("SANITY_PROJECT_ID is not configured");
  const url = new URL(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`);
  url.searchParams.set("query", query);
  url.searchParams.set("perspective", perspective);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(`$${key}`, JSON.stringify(value)));
  const response = await fetch(url, {headers: token ? {Authorization: `Bearer ${token}`} : {}});
  if (!response.ok) throw new Error(`Sanity request failed: ${response.status}`);
  return (await response.json()).result;
}

export function send(res, status, body, privateResponse = false) {
  res.setHeader("Cache-Control", status === 200 && !privateResponse ? "s-maxage=60, stale-while-revalidate=300" : "no-store");
  res.status(status).json(body);
}
