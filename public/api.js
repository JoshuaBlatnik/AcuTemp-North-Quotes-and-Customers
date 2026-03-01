export async function apiGet(url){
  const r = await fetch(url)
  return await r.json()
}

async function readJsonSafe(r){
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j && j.message ? j.message : "Request failed")
  return j
}

export async function apiPost(url, body){
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
  return await readJsonSafe(r)
}

export async function apiPut(url, body){
  const r = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
  return await readJsonSafe(r)
}

export async function apiDelete(url){
  const r = await fetch(url, { method: "DELETE" })
  return await readJsonSafe(r)
}