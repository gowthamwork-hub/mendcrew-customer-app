const key = "mendcrew.session";
export async function readSession() {
  return typeof window === "undefined"
    ? null
    : window.sessionStorage.getItem(key);
}
export async function saveSession(value: string) {
  window.sessionStorage.setItem(key, value);
}
export async function clearSession() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(key);
}
