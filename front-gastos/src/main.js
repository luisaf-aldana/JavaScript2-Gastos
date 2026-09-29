import { getToken, clearToken } from "./utils/auth.js";
import { apiFetch } from "./utils/api.js";

//Cerrar sesión
document.getElementById("logout").addEventListener("click", () => {
  clearToken();
  alert("Has cerrado sesión");
  window.location.href = "login.html";
});

//Verificar el token
async function verifyToken() {
  const token = getToken();
  if (!token) return redirectToLogin();

  try {
    await apiFetch("/auth/verify", "GET", null, token);
  } catch (error) {
    clearToken();
    redirectToLogin();
  }
}

function redirectToLogin() {
  alert("Debes iniciar sesión");
  window.location.href = "login.html";
}

verifyToken();
