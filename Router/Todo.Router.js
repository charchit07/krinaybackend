const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const todoRouter = express.Router();

const convertUTCtoIST = (utcDateStr) => {
  const utcDate = new Date(utcDateStr);
  const istOffset = 330;
  const istDate = new Date(utcDate.getTime() + istOffset * 60000);
  return istDate.toUTCString();
};

todoRouter.get("/todos", async (req, res) => {
  try {
    const todos = await prisma.todo.findMany();
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch movies" });
  }
});

// Create a new Todo
todoRouter.post("/todos", async (req, res) => {
  try {
    const payload = req.body;
    payload.created_at = convertUTCtoIST(new Date());
    payload.updated_at = convertUTCtoIST(new Date());
    const todo = await prisma.todo.create({
      data: payload,
    });
    res.send({ data: todo, msg: "Todo Created" });
  } catch (error) {
    res.status(500).send({ msg: "Todo Has Not Been Created" });
  }
});

// Update a Todo
todoRouter.patch("/todos/:id", async (req, res) => {
  const todoID = req.params.id;
  const payload = req.body;
  try {
    payload.updated_at = convertUTCtoIST(new Date());
    let todo = await prisma.todo.update({
      where: {
        id: todoID,
      },
      data: payload,
    });
    res.send({ msg: `Todo with id:${todoID} has been updated`, todo });
  } catch (error) {
    console.error(error);
    res.send({ msg: "Something went wrong" });
  }
});

// Delete a Todo
todoRouter.delete("/todos/:id", async (req, res) => {
  const todoID = req.params.id;
  try {
    await prisma.todo.delete({
      where: {
        id: todoID,
      },
    });
    res.send({ msg: `Todo with id:${todoID} has been deleted` });
  } catch (error) {
    res.send({ msg: "Something went wrong", error: error.message });
  }
});

module.exports = todoRouter;
