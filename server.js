// API
// CREATE AND USE USER
// CRUD TASKS IN TODO
//heroku deploy
require("dotenv").config();
process.env.NODE_ENV != "production" ? require("dotenv").config() : null;

const express = require("express");
const morgan = require("morgan");
const { urlencoded, json } = require("body-parser");
// - heroku deploy
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
// -heroku deploy
const jwt = require("jsonwebtoken");
const cors = require("cors");

//LOAD SWAGGER
const swaggerJsDoc = require("swagger-jsdoc");
const { serve, setup } = require("swagger-ui-express");

//SWAGGER SETUP
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "MN - HOMEWORK FOR CRACOW COURSE",
      description:
        "Finished homework - PART1 of FULLSTACK task. Check my github: https://github.com/napiorkowskimarcin",
    },
  },
  apis: ["./routes/index.js", "./routes/user.js", "./routes/todos.js"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);

//LOAD JWT MIDDLEWARE
const ensureAuthentication = require("./middleware/auth");

//set a port
const PORT = process.env.PORT || 3000;

//start an app
const app = express();

//allow bodyParser to recognize a body
app.use(urlencoded({ extended: false }));
app.use(json());

//cors
app.use(cors());

//login data
app.use(morgan("dev"));

//routes
app.use("/api/todos", ensureAuthentication, require("./routes/todos"));
app.use("/api/user", require("./routes/user"));
app.use("/api/", require("./routes/index"));
//load swagger route
app.use("/api-docs", serve, setup(swaggerDocs));
//protect unexpected input
app.all("*", (req, res) => {
  res.send("no route like this");
});

//start listening
app.listen(PORT, () => console.log(`Server has started on: ${PORT}`));
