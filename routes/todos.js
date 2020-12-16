const express = require("express");
const router = express.Router();
const pool = require("../config/config");

//READ TASKS
/**
 * @swagger
/api/todos/:
*    get:
*      summary: "Find tasks"
*      description: "Returns a list of tasks created by your user"
*      produces:
*      - "application/xml"
*      - "application/json"
*      parameters:
*      - name: "Authorization"
*        in: "header"
*        description: "bearer with accessToken to place"
*        required: true
*      responses:
*        "200":
*          description: "successful operation"
*/
router.get("/", async (req, res) => {
  const userName = req.name;

  try {
    const taskList = await pool.query(
      "SELECT * FROM todo_tasklist WHERE todo_user = $1",
      [userName]
    );
    let taskNameArray = taskList;
    // taskList.rows.forEach((task) => taskNameArray.push(task.todo_name));
    res.status(200).json({ taskNameArray });
  } catch (error) {
    console.log("here");
    console.log(error);
  }
});

//READ TASK WITH AN ID
/**
 * @swagger
/api/todos/{Id}:
*    get:
*      summary: "Find task by ID"
*      description: "Returns a single task"
*      produces:
*      - "application/xml"
*      - "application/json"
*      parameters:
*      - name: "Id"
*        in: "path"
*        description: "ID of task to return"
*        required: true
*        type: "integer"
*      - name: "Authorization"
*        in: "header"
*        description: "bearer with accessToken to place"
*        required: true
*      responses:
*        "200":
*          description: "successful operation"
*/
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
/**
 * @swagger
/api/todos/create:
*    post:
*      summary: "Create a task"
*      description: "Create a task with name of task and description od it. You need to include: 'taskName' and 'taskDescription"
*      produces:
*      - "application/xml"
*      - "application/json"
*      parameters:
*      - name: "body"
*        in: "body"
*        required: true
*      - name: "Authorization"
*        in: "header"
*        description: "bearer with accessToken to place"
*        required: true
*      responses:
*        "200":
*          description: "successful operation"
*/
router.post("/create", async (req, res) => {
  const userName = req.name;
  const { taskName, taskDescription } = req.body;
  console.log(req);

  if (Object.keys(req.body).length === 2) {
    try {
      const checkIfAlreadyExist = await pool.query(
        "SELECT * FROM todo_tasklist WHERE todo_name = $1",
        [taskName]
      );
      if (checkIfAlreadyExist.rows.length) {
        return res.json({ message: "task with that nam already exists" });
      }
      await pool.query(
        "INSERT INTO todo_tasklist (todo_user,todo_name,todo_desc ) VALUES ($1, $2, $3)",
        [userName, taskName, taskDescription]
      );
      res.json({ message: "success" });
    } catch (error) {
      console.error(error);
      res.json({ message: "try again" });
    }
  } else {
    res.json({ message: "some keys are missing" });
  }
});

//UPDATE TASK
/**
 * @swagger
/api/todos/update:
*    post:
*      summary: "Update a task"
*      description: "Update a task accordingly to the pushed id in body"
*      produces:
*      - "application/xml"
*      - "application/json"
*      parameters:
*      - name: "body"
*        in: "body"
*        required: true
*      - name: "Authorization"
*        in: "header"
*        description: "bearer with accessToken to place"
*        required: true
*      responses:
*        "200":
*          description: "successful operation"
*/
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
/**
 * @swagger
/api/todos/delete/{Id}:
*    post:
*      summary: "Remove a task"
*      description: "Remove a task accordingly to the pushed id in body"
*      produces:
*      - "application/xml"
*      - "application/json"
*      parameters:
*      - name: "Id"
*        in: "path"
*        description: "ID of task to delete"
*        required: true
*        type: "integer"
*      - name: "Authorization"
*        in: "header"
*        description: "bearer with accessToken to place"
*        required: true
*      responses:
*        "200":
*          description: "successful operation"
*/
router.post("/delete/:id", async (req, res) => {
  const userName = req.name;
  const taskToRemove = req.params.id;

  try {
    const taskToRemoveByTaskId = await pool.query(
      "SELECT * FROM todo_tasklist WHERE todo_id = $1",
      [taskToRemove]
    );

    if (!taskToRemoveByTaskId.rows.length) {
      res.send("task not found");
    }
    if (taskToRemoveByTaskId.rows[0].todo_user === userName) {
      await pool.query("DELETE FROM todo_tasklist WHERE todo_id = $1", [
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
/**
 * @swagger
/api/todos/truncate:
*    post:
*      summary: "Clear storage"
*      description: "Removes all of the tasks from this list"
*      responses:
*        "200":
*          description: "successful operation"
*/
router.post("/truncate", async (req, res) => {
  await pool.query("TRUNCATE todo_tasklist");
  res.send("todo list cleared");
});

module.exports = router;
