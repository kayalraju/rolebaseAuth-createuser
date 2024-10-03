// 3rd-party module
const express = require("express");
const routeLabel = require("route-label");

// import controller
const officeBoyController = require("../../modules/auth/officeBoy/controller/officeBoy.controller");

// import others
const { loginValidator } = require("../../helper/validation");
const { officeBoyAuth } = require("../../middleware/auth");

// Initialize Express Router for creating router object
const router = express.Router();

// Wrap the express router with route-label package
const namedRouter = routeLabel(router);

// 1.Define Employee Login API route
namedRouter.post(
  "office-boy.login",
  "/office-boy/login",
  loginValidator,
  officeBoyController.officeBoyLogin
);

// 2.Define Employee Login Page route
namedRouter.get(
  "office-boy.login-page",
  "/office-boy/login",
  officeBoyController.officeBoyLoginPage
);

// 3.Defie Dashboard route
namedRouter.get(
  "office-boy.dashboard",
  "/office-boy/dashboard",
  officeBoyAuth,
  officeBoyController.dashboard
);

// 4.Define logout route
namedRouter.get(
  "office-boy.logout",
  "/office-boy/logout",
  officeBoyController.logout
);

module.exports = router;
