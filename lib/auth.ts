export const AUTH_KEY = "ai-kobutu-authed";

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function login(): void {
  localStorage.setItem(AUTH_KEY, "true");
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}
