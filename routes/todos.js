const express = require("express");
const router = express.Router();
const pool = require("../config/config");

//GET USER NAME AND LIST OF TASKS
router.get("/", async (req, res) => {
  const userName = req.name;
  try {
    const taskList = await pool.query(
      "SELECT * FROM todo_tasklist WHERE todo_user = $1",
      [userName]
    );
    let taskNameArray = [];
    taskList.rows.forEach((task) => taskNameArray.push(task.todo_name));
    const message = `Hello. This is an API to do a TODO list with CRUD in SQL. You are authenticated as ${req.name}.
    List of your tasks: ${taskNameArray}`;
    res.status(200).send(message);
  } catch (error) {
    console.log(error);
  }
});

//CREATE TASK
router.post("/create", async (req, res) => {
  const userName = req.name;
  const { taskName, taskDescription } = req.body;

  if (Object.keys(req.body).length === 2) {
    try {
      await pool.query(
        "INSERT INTO todo_tasklist (todo_user,todo_name,todo_desc ) VALUES ($1, $2, $3)",
        [userName, taskName, taskDescription]
      );
      res.send(`You have created a task as user:${userName},
    Your task title is: ${taskName},
    You need to do: ${taskDescription}`);
    } catch (error) {
      console.error(error);
      res.send("Try again");
    }
  } else {
    res.send("some keys are missing");
  }
});

//DELETE TASK
router.post("/delete", async (req, res) => {
  const userName = req.name;
  const taskToRemove = req.body.taskName;

  try {
    const taskToRemoveByTaskName = await pool.query(
      "SELECT * FROM todo_tasklist WHERE todo_name = $1",
      [taskToRemove]
    );
    console.log(taskToRemoveByTaskName.rows.length);
    if (!taskToRemoveByTaskName.rows.length) {
      res.send("task not found");
    }
    if (taskToRemoveByTaskName.rows[0].todo_user === userName) {
      await pool.query("DELETE FROM todo_tasklist WHERE todo_name = $1", [
        taskToRemove,
      ]);
      res.status(200).send(`Succesfully removed task:${taskToRemove}`);
    } else {
      res.send("You are not allowed to remove this task!");
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
