const jwt = require("jsonwebtoken");

const ensureAuthentication = (req, res, next) => {
  const authorization = req.get("Authorization");
  if (authorization) {
    try {
      const accessToken = authorization.split(" ")[1];
      //const payload = jwt.verify(accessToken, process.env.jwtToken);
      const payload = jwt.verify(accessToken, "secret");
      req.name = payload.name;
      next();
    } catch (error) {
      res.send(error);
    }
  } else {
    res.send("You are not authorized");
  }
};

module.exports = ensureAuthentication;
