const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/config");
const maxAge = require("../config/maxAge");

//CREATE TOKEN FOR LOG-IN
const createToken = (user) => {
  const payload = { name: user };
  console.log(payload.name);
  return jwt.sign(payload, "secret to be hidden", {
    expiresIn: maxAge,
  });
};

//CREATE USER
/**
 * @swagger
/api/user/signup:
*    post:
*      summary: "Create you own user"
*      description: "You have a chance to create your own user. "
*      parameters:
*      - name: "body"
*        description: "body needs to include 'name' and 'password'"
*        in: "body"
*        required: true
*      responses:
*        "201":
*          description: "successful operation"
*/
router.post("/signup", async (req, res) => {
  const name = req.body.name;
  const checkIfExists = await pool.query(
    "SELECT us_name, us_id, us_password FROM todo_user WHERE us_name = $1",
    [name]
  );
  if (checkIfExists.rowCount) {
    res.json({ message: "user with that name already exists", created: false });
  } else {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const user = await pool.query(
        "INSERT INTO todo_user (us_name, us_password) VALUES ($1, $2)",
        [name, hashedPassword]
      );
      res.json({ created: true });
    } catch (error) {
      console.error(error);
      res.json({ message: "try again" });
    }
  }
});

//LOG IN WITH USER DATA
/**
 * @swagger
/api/user/signin:
*    post:
*      summary: "Log with your own user"
*      description: "After being loged in - copy `accessToken`! use it with Authorization, as: `bearer  accessToken`"
*      parameters:
*      - name: "body"
*        description: "body needs to include 'name' and 'password'"
*        in: "body"
*        required: true
*      responses:
*        "200":
*          description: "successful operation"
*/
router.post("/signin", async (req, res) => {
  const { password, name } = req.body;
  let user = await pool.query(
    "SELECT us_name, us_id, us_password FROM todo_user WHERE us_name = $1",
    [name]
  );
  user = user.rows[0];

  if (!user) {
    res
      .status(403)
      .json({ message: "no user with that name- please create an accout" });
  }
  try {
    if (await bcrypt.compare(password, user.us_password)) {
      username = user.us_name;
      const accessToken = await createToken(user.us_name);
      //user.us_password = "top secret";
      res.status(200).json({ username, accessToken });
    } else {
      res.status(403).json({ message: "password incorrect" });
    }
  } catch (error) {
    console.error(error);
    res.send("Try again");
  }
});

module.exports = router;
