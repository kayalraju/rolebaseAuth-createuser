// 3rd-party module
const express = require("express");
const routeLabel = require("route-label");

// import controller
const managerController = require("../../modules/auth/manager/controller/manager.controller");

// import others
const { loginValidator } = require("../../helper/validation");
const { managerAuth } = require("../../middleware/auth");

// Initialize Express Router for creating router object
const router = express.Router();

// Wrap the express router with route-label package
const namedRouter = routeLabel(router);

// 1.Define Manager Login API route
namedRouter.post(
  "manager.login",
  "/manager/login",
  loginValidator,
  managerController.managerLogin
);

// 2.Define Admin Login Page route
namedRouter.get(
  "manager.login-page",
  "/manager/login",
  managerController.managerLoginPage
);

// 3.Defie Dashboard route
namedRouter.get(
  "manager.dashboard",
  "/manager/dashboard",
  managerAuth,
  managerController.dashboard
);

// 4.Define logout route
namedRouter.get("manager.logout", "/manager/logout", managerController.logout);

module.exports = router;
