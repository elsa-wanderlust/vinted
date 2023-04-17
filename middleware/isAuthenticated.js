const mongoose = require("mongoose");
const User = require("../model/User");
const isAuthenticated = async (req, res, next) => {
  // check IF a token has been provided
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    }).select("account");
    // check IF there is a user with that token in the DB
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    } else {
      req.user = user;
      // On crée une clé "user" dans req. La route dans laquelle le middleware est appelé pourra avoir accès à req.user
      return next();
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = isAuthenticated;
