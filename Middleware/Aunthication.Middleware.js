const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, process.env.SECRETKEY, (err, decoded) => {
      if (decoded) {
        // Store the user ID in the request object
        req.user = decoded.userID;
        next();
      } else {
        res.status(401).json({ msg: "Please Login" }); // Use res.status().json() instead of req.send()
      }
    });
  } else {
    res.status(401).json({ msg: "Please Login" }); // Use res.status().json() instead of req.send()
  }
};

module.exports = {
  authenticate,
};
