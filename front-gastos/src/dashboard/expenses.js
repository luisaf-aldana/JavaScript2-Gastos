import { apiFetch } from "../utils/api.js";
import { getToken } from "../utils/auth.js";

//Referencias a los elementos del DOM
const form = document.getElementById("expenseForm");
const inputTitle = document.getElementById("expenseTitle");
const inputAmount = document.getElementById("expenseAmount");
const selectCategory = document.getElementById("expenseCategory");
const inputDate = document.getElementById("expenseDate");
const inputId = document.getElementById("expenseId");
const btnSave = document.getElementById("saveExpense");
const btnCancel = document.getElementById("cancelUpdate");
const btnUpdate = document.getElementById("updateExpense");
const expenseList = document.getElementById("expenseList");

//Formateadores para mostrar monto y fecha
const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

//Convierte la fecha de Mongo (ISO) al formato del input date (YYYY-MM-DD)
function toInputDate(isoDate) {
  return isoDate ? new Date(isoDate).toISOString().split("T")[0] : "";
}

//Muestra la fecha en formato legible (en UTC para que no se corra un día)
function toDisplayDate(isoDate) {
  if (!isoDate) return "Sin fecha";
  return new Date(isoDate).toLocaleDateString("es-CO", { timeZone: "UTC" });
}

//Lee y valida los datos del formulario
function getFormData() {
  const title = inputTitle.value.trim();
  const amount = Number(inputAmount.value);
  const category = selectCategory.value;
  const date = inputDate.value;

  if (!title || !inputAmount.value || !category) {
    alert("Título, monto y categoría son obligatorios");
    return null;
  }
  if (Number.isNaN(amount) || amount <= 0) {
    alert("El monto debe ser un número mayor a 0");
    return null;
  }
  return { title, amount, category, date };
}

//Cargar las categorias en el select
async function loadCategories() {
  try {
    const token = getToken();
    const categories = await apiFetch("/categories/list", "GET", null, token);

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category._id;
      option.textContent = category.name;
      selectCategory.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    alert("No pudimos cargar las categorias");
  }
}

//Listar los gastos
async function loadExpenses() {
  try {
    const token = getToken();
    const expenses = await apiFetch("/expenses/list", "GET", null, token);
    expenseList.innerHTML = "";

    if (expenses.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Aún no tienes gastos registrados";
      expenseList.appendChild(li);
      return;
    }

    expenses.forEach((expense) => {
      const li = document.createElement("li");

      //Se usa textContent para evitar inyectar HTML desde los datos
      const info = document.createElement("span");
      const categoryName = expense.category?.name || "Sin categoría";
      info.textContent = `${expense.title} - ${currency.format(expense.amount)} | ${categoryName} | ${toDisplayDate(expense.date)}`;

      const actions = document.createElement("div");
      actions.className = "actions";

      const btnEdit = document.createElement("button");
      btnEdit.className = "edit";
      btnEdit.textContent = "Editar";
      btnEdit.addEventListener("click", () => editExpense(expense));

      const btnDelete = document.createElement("button");
      btnDelete.className = "delete";
      btnDelete.textContent = "Eliminar";
      btnDelete.addEventListener("click", () => deleteExpense(expense));

      actions.append(btnEdit, btnDelete);
      li.append(info, actions);
      expenseList.appendChild(li);
    });
  } catch (error) {
    console.error(error);
    alert("No pudimos cargar los gastos");
  }
}

//Guardar un gasto
async function saveExpense() {
  const data = getFormData();
  if (!data) return;

  try {
    const token = getToken();
    await apiFetch("/expenses/new", "POST", data, token);
    alert("Gasto guardado correctamente");
    form.reset();
    loadExpenses();
  } catch (error) {
    console.error(error);
    alert("No pudimos crear el gasto");
  }
}

//Cargar los datos del gasto en el formulario para editarlo
function editExpense(expense) {
  inputId.value = expense._id;
  inputTitle.value = expense.title;
  inputAmount.value = expense.amount;
  selectCategory.value = expense.category?._id || "";
  inputDate.value = toInputDate(expense.date);

  btnSave.style.display = "none";
  btnUpdate.style.display = "inline-block";
  btnCancel.style.display = "inline-block";
  form.scrollIntoView({ behavior: "smooth" });
}

//Cancelar la edición y volver al modo "crear"
function cancelUpdate() {
  form.reset();
  inputId.value = "";
  btnSave.style.display = "inline-block";
  btnUpdate.style.display = "none";
  btnCancel.style.display = "none";
}

//Actualizar un gasto
async function updateExpense() {
  const id = inputId.value;
  if (!id) return;

  const data = getFormData();
  if (!data) return;

  try {
    const token = getToken();
    await apiFetch(`/expenses/${id}`, "PUT", data, token);
    alert("Gasto actualizado correctamente");
    cancelUpdate();
    loadExpenses();
  } catch (error) {
    console.error(error);
    alert("No pudimos actualizar el gasto");
  }
}

//Eliminar un gasto
async function deleteExpense(expense) {
  const ok = confirm(`¿Seguro que deseas eliminar el gasto "${expense.title}"?`);
  if (!ok) return;

  try {
    const token = getToken();
    await apiFetch(`/expenses/${expense._id}`, "DELETE", null, token);
    alert("Gasto eliminado correctamente");

    //Si se estaba editando el gasto eliminado, se limpia el formulario
    if (inputId.value === expense._id) cancelUpdate();
    loadExpenses();
  } catch (error) {
    console.error(error);
    alert("No pudimos eliminar el gasto");
  }
}

btnSave.addEventListener("click", saveExpense);
btnUpdate.addEventListener("click", updateExpense);
btnCancel.addEventListener("click", cancelUpdate);

document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  loadExpenses();
});