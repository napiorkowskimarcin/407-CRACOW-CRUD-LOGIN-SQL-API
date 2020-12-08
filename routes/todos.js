const express = require("express");
const router = express.Router();
const pool = require("../config/config");

//READ TASKS
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

//READ TASK WITH AN ID
router.get("/:id", async (req, res) => {
  const taskId = req.params.id;

  try {
    const taskList = await pool.query(
      "SELECT * FROM todo_tasklist WHERE todo_id = $1",
      [taskId]
    );
    if (!taskList.rows.length) {
      return res.send("There is no task with that ID");
    }
    if (taskList.rows[0].todo_user !== req.name) {
      return res.send("you are not allowed to see this task");
    }
    const message = `Hello. This is an API to do a TODO list with CRUD in SQL. You are authenticated as ${req.name}.
    Task that you are looking for:
    ID:  ${taskList.rows[0].todo_id}
    CREATED BY: ${taskList.rows[0].todo_user}
    NAME OF THE TASK: ${taskList.rows[0].todo_name}
    SUBJECT OF THE TASK: ${taskList.rows[0].todo_desc}`;
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
      const checkIfAlreadyExist = await pool.query(
        "SELECT * FROM todo_tasklist WHERE todo_name = $1",
        [taskName]
      );
      if (checkIfAlreadyExist.rows.length) {
        return res.send("task with that name already exist");
      }
      await pool.query(
        "INSERT INTO todo_tasklist (todo_user,todo_name,todo_desc ) VALUES ($1, $2, $3)",
        [userName, taskName, taskDescription]
      );
      res.send(
        `You have created a task as user:${userName},
        Your task title is: ${taskName},
        You need to do: ${taskDescription}`
      );
    } catch (error) {
      console.error(error);
      res.send("Try again");
    }
  } else {
    res.send("some keys are missing");
  }
});

//UPDATE TASK
router.post("/update", async (req, res) => {
  const userName = req.name;
  const { taskName, taskDescription, taskId } = req.body;

  try {
    const ifTaskExists = await pool.query(
      "SELECT * FROM todo_tasklist WHERE todo_id = $1",
      [taskId]
    );

    if (!ifTaskExists.rows.length) {
      return res.send("there is no task with that Id!");
    }
    await pool.query(
      "UPDATE todo_tasklist SET todo_name=($1), todo_desc=($2) WHERE todo_id=($3)",
      [taskName, taskDescription, taskId]
    );
    res.send(`Updated task`);
  } catch (error) {
    console.log(error);
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

//CLEAR ALL DATA
router.post("/truncate", async (req, res) => {
  await pool.query("TRUNCATE todo_tasklist");
  res.send("todo list cleared");
});

module.exports = router;
