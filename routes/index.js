const express = require("express");
const router = express.Router();
const pool = require("../config/config");
/**
 * @swagger
/api/:
*    get:
*      summary: "Welcome page"
*      description: "Create user or log in please!"
*      responses:
*        "200":
*          description: "successful operation"
*/
router.get("/", (req, res) => {
  const message =
    "Hello. This is an API to do a TODO list with CRUD in SQL. Feel free to create an user and log in.";
  res.status(200).send(message);
});

//SEE ALL USERS
/**
 * @swagger
/api/users/:
*    get:
*      summary: "Check users"
*      description: "Returns a list of users"
*      produces:
*      - "application/xml"
*      - "application/json"
*      responses:
*        "200":
*          description: "successful operation"
*/
router.get("/users/", async (req, res) => {
  let userList = await pool.query("SELECT * FROM todo_user");
  let userListArray = [];
  userList.rows.forEach((user) => userListArray.push(user.us_name));

  const message = userListArray;
  res.status(200).send(message);
});

router.get("/db", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM test_table");
    const results = { results: result ? result.rows : null };
    res.render("pages/db", results);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

module.exports = router;
