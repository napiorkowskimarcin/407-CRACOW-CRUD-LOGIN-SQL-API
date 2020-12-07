// API
// CREATE AND USE USER
// CRUD TASKS IN TODO

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const pool = require("./config/config");
const jwt = require("jsonwebtoken");

//LOAD JWT MIDDLEWARE
const ensureAuthentication = require("./middleware/auth");

//set a port
const PORT = process.env.PORT || 3000;

//start an app
const app = express();

//allow bodyParser to recognize a body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//login data
app.use(morgan("dev"));

//routes
app.use("/todos", ensureAuthentication, require("./routes/todos"));
app.use("/user", require("./routes/user"));
app.use("/", require("./routes/index"));

//start listening
app.listen(PORT, () => console.log(`Server has started on: ${PORT}`));
