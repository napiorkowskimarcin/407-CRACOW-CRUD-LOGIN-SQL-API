const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/config");
const maxAge = require("../config/maxAge");

//CREATE TOKEN FOR LOG-IN
//CREATE TOKEN
const createToken = (user) => {
  const payload = { name: user.us_name };
  return jwt.sign(payload, "secret to be hidden", {
    expiresIn: maxAge,
  });
};

//SEE ALL USERS
router.get("/", async (req, res) => {
  let userList = await pool.query("SELECT * FROM todo_user");
  console.log(userList.rows);
  userList = userList.rows;
  userList.map((element) => (element.password = "it is a secret!"));
  const message = `please sign in. There is a list of valid users:
  ${userList}`;
  res.status(200).send(message);
});

//CREATE USER
router.post("/signup", async (req, res) => {
  const name = req.body.name;
  const checkIfExists = await pool.query(
    "SELECT us_name, us_id, us_password FROM todo_user WHERE us_name = $1",
    [name]
  );
  if (checkIfExists.rowCount) {
    res.send("user with that name already exists");
  } else {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const user = await pool.query(
        "INSERT INTO todo_user (us_name, us_password) VALUES ($1, $2)",
        [name, hashedPassword]
      );
      res.send(`You have created an user:${name}`);
    } catch (error) {
      console.error(error);
      res.send("Try again");
    }
  }
});

//LOG IN WITH USER DATA
router.post("/signin", async (req, res) => {
  const { password, name } = req.body;
  let user = await pool.query(
    "SELECT us_name, us_id, us_password FROM todo_user WHERE us_name = $1",
    [name]
  );
  user = user.rows[0];
  if (!user) {
    res.status(200).send("no user with that name- please create an accout");
  }

  try {
    if (await bcrypt.compare(password, user.us_password)) {
      const accessToken = await createToken(user);
      user.us_password = "top secret";
      res.send({ user, accessToken });
    } else {
      res.send("password incorrect");
    }
  } catch (error) {
    console.error(error);
    res.send("Try again");
  }
});

module.exports = router;
