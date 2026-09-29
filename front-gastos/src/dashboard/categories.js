import { apiFetch } from "../utils/api.js";
import { getToken } from "../utils/auth.js";

//Referencias a los elementos del DOM
const form = document.getElementById("categoryForm");
const inputName = document.getElementById("categoryName");
const inputId = document.getElementById("categoryId");
const btnSave = document.getElementById("saveCategory");
const btnUpdate = document.getElementById("updateCategory");
const btnCancel = document.getElementById("cancelUpdate");
const list = document.getElementById("categoryList");

//Cargar categorias en la lista
async function loadCategories() {
  try {
    const token = getToken();
    const categories = await apiFetch("/categories/list", "GET", null, token);
    list.innerHTML = "";

    //validar si categories esta vacio .length

    categories.forEach((category) => {
      const li = document.createElement("li");
      li.innerHTML = `
                <span>${category.name}</span>
                <button class="edit">Editar</button>
            `;
      li.querySelector("button").addEventListener("click", () => {
        editCategory(category);
      });
      list.appendChild(li);
    });
  } catch (error) {
    alert("No pudimos cargar las categorias");
    console.error(error);
  }
}

//Guardar una nueva categoria
async function saveCategory() {
  const name = inputName.value.trim();
  if (!name) {
    alert("Ingresa un nombre para la categoría");
    return;
  }

  try {
    const token = getToken();
    await apiFetch("/categories/new", "POST", { name }, token);
    alert("Categoría creada correctamente");
    form.reset();
    loadCategories();
  } catch (error) {
    console.error(error);
    alert("No pudimos crear la categoría");
  }
}

//Cargar los datos de la categoria en el input y tambien el id
function editCategory(category) {
  inputId.value = category._id;
  inputName.value = category.name;
  btnSave.style.display = "none";
  btnCancel.style.display = "inline-block";
  btnUpdate.style.display = "inline-block";
}

function cancelUpdate() {
  btnSave.style.display = "inline-block";
  btnCancel.style.display = "none";
  btnUpdate.style.display = "none";
  form.reset();
  inputId.value = "";
}

async function updateCategory() {
  const id = inputId.value;
  const name = inputName.value.trim();
  if (!id || !name) {
    alert("El nombre es obligatorio");
    return;
  }
  try {
    const token = getToken();
    await apiFetch(`/categories/${id}`, "PUT", { name }, token);
    alert("Categoria actualizada correctamente");
    cancelUpdate();
    loadCategories();
  } catch (error) {
    console.error(error);
    alert("Error al actualizar la categoría");
    cancelUpdate();
  }
}

btnSave.addEventListener("click", saveCategory);
btnCancel.addEventListener("click", cancelUpdate);
btnUpdate.addEventListener("click", updateCategory);

document.addEventListener("DOMContentLoaded", loadCategories);
