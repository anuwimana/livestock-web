const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function getToken() {
  return typeof window === "undefined" ? null : localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
}

export async function registerProfile() {
  const res = await fetch(`${API_URL}/register/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) {
    let message = "Could not set up your profile.";
    try {
      const data = await res.json();
      if (data.detail) message = data.detail;
    } catch {}
    localStorage.removeItem("token");
    throw new Error(message);
  }
}

export async function login(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.msg || "Login failed");
  }
  localStorage.setItem("token", data.access_token);
  await registerProfile();
  return data;
}

export async function signup(fullName, email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY },
    body: JSON.stringify({
      email,
      password,
      data: { full_name: fullName },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data.msg || data.error_description || data.message || "Sign up failed"
    );
  }
  if (data.access_token) {
    localStorage.setItem("token", data.access_token);
    await registerProfile();
  }
  return data;
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  let data = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    const message =
      (data && data.detail) || (data ? JSON.stringify(data) : "Request failed");
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}