//Establecer el token en sessionStorage
export function setToken(token) {
  sessionStorage.setItem("token", token);
  //localStorage.setItem("token", token)
}
//Obtener el token
export function getToken() {
  return sessionStorage.getItem("token");
}
//Eliminar el token
export function clearToken() {
  sessionStorage.removeItem("token");
}
