const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const message =
    "Hello. This is an API to do a TODO list with CRUD in SQL. Feel free to create an user and log in.";
  res.status(200).send(message);
});

module.exports = router;
