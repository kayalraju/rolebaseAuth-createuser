// 3rd-party module
const express = require("express");
const routeLabel = require("route-label");

// import controller
const employeeController = require("../../modules/auth/employee/controller/employee.controller");

// import others
const { loginValidator } = require("../../helper/validation");
const { employeeAuth } = require("../../middleware/auth");

// Initialize Express Router for creating router object
const router = express.Router();

// Wrap the express router with route-label package
const namedRouter = routeLabel(router);

// 1.Define Employee Login API route
namedRouter.post(
  "employee.login",
  "/employee/login",
  loginValidator,
  employeeController.employeeLogin
);

// 2.Define Employee Login Page route
namedRouter.get(
  "employee.login-page",
  "/employee/login",
  employeeController.employeeLoginPage
);

// 3.Defie Dashboard route
namedRouter.get(
  "employee.dashboard",
  "/employee/dashboard",
  employeeAuth,
  employeeController.dashboard
);

// 4.Define logout route
namedRouter.get(
  "employee.logout",
  "/employee/logout",
  employeeController.logout
);

module.exports = router;
