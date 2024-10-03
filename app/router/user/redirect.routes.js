// 3rd-party module
const express = require("express");
const routeLabel = require("route-label");

// import controller

// import others

// Initialize Express Router for creating router object
const router = express.Router();

// Wrap the express router with route-label package
const namedRouter = routeLabel(router);

// 1.Define redirect to Admin page route
namedRouter.get("redirect.route", "/", (req, res) => {
  res.redirect("/admin/login");
});

module.exports = router;
