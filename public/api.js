// Sends a GET request and returns the parsed JSON response.
export async function apiGet(url){
  const r = await fetch(url)
  return await r.json()
}

// Safely parses JSON and throws an error if the response is not successful.
async function readJsonSafe(r){
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j && j.message ? j.message : "Request failed")
  return j
}

// Sends a POST request with a JSON body and returns the validated response.
export async function apiPost(url, body){
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
  return await readJsonSafe(r)
}

// Sends a PUT request with a JSON body and returns the validated response.
export async function apiPut(url, body){
  const r = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
  return await readJsonSafe(r)
}

// Sends a DELETE request and returns the validated response.
export async function apiDelete(url){
  const r = await fetch(url, { method: "DELETE" })
  return await readJsonSafe(r)
}
