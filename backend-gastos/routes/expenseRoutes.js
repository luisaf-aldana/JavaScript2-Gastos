const express = require("express");
const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const auth = require("../middleware/auth");

const router = express.Router();

//Crear un gasto
router.post("/new", auth, async (req, res) => {
  const { title, amount, date, category } = req.body;
  try {
    const expense = new Expense({
      title,
      amount,
      date: date || Date.now(),
      category,
      user: req.user.id,
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

//Listar los gastos
router.get("/list", auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id })
      .populate("category", "name") // Trae el nombre de la categoría
      .sort({ date: -1 }); // Los más recientes primero

    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los gastos" });
  }
});

//Actualizar un gasto
router.put("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { title, amount, date, category } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID de gasto no válido" });
  }

  try {
    // Solo se actualizan los campos que llegan en el body
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (amount !== undefined) updates.amount = amount;
    if (date) updates.date = date;
    if (category !== undefined) updates.category = category;

    const expense = await Expense.findOneAndUpdate(
      { _id: id, user: req.user.id }, // El gasto debe pertenecer al usuario
      updates,
      { runValidators: true, new: true },
    ).populate("category", "name");

    if (!expense) return res.status(404).json({ error: "Gasto no encontrado" });

    res.json(expense);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

//Eliminar un gasto
router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID de gasto no válido" });
  }

  try {
    const expense = await Expense.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!expense) return res.status(404).json({ error: "Gasto no encontrado" });

    res.json({ message: "Gasto eliminado correctamente", id: expense._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el gasto" });
  }
});

module.exports = router;