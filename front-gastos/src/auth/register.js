import { apiFetch } from "../utils/api.js";

//Función para manejar el formulario de registro
async function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {
    const response = await apiFetch("/auth/register", "POST", {
      name,
      email,
      password,
    });

    alert("Registro exitoso, redirigiendo a login..");
    window.location.href = "login.html";
  } catch (error) {
    alert(`Error en el registro: ${error.message}`);
    console.error(error);
  }
}

document
  .getElementById("registerForm")
  .addEventListener("submit", handleRegister);
