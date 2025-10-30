export async function api(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("token");
    try { await res.clone().json(); } catch (_) {}
    window.location.href = "/login";
  }

  return res;
}

export function clearAuth() {
  localStorage.removeItem("token");
}




