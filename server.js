// API
// CREATE AND USE USER
// CRUD TASKS IN TODO

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const pool = require("./config/config");
const jwt = require("jsonwebtoken");

//LOAD SWAGGER
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//login data
app.use(morgan("dev"));

//routes
app.use("/api/todos", ensureAuthentication, require("./routes/todos"));
app.use("/api/user", require("./routes/user"));
app.use("/api/", require("./routes/index"));
//load swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
//protect unexpected input
app.all("*", (req, res) => {
  res.send("no route like this");
});

//start listening
app.listen(PORT, () => console.log(`Server has started on: ${PORT}`));
