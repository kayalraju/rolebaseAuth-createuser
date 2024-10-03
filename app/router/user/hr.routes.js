// 3rd-party module
const express = require("express");
const routeLabel = require("route-label");

// import controller
const hrController = require("../../modules/auth/hr/controller/hr.controller");

// import others
const { loginValidator } = require("../../helper/validation");
const { hrAuth } = require("../../middleware/auth");

// Initialize Express Router for creating router object
const router = express.Router();

// Wrap the express router with route-label package
const namedRouter = routeLabel(router);

// 1.Define HR Login API route
namedRouter.post("hr.login", "/hr/login", loginValidator, hrController.hrLogin);

// 2.Define HR Login Page route
namedRouter.get("hr.login-page", "/hr/login", hrController.hrLoginPage);

// 3.Defie Dashboard route
namedRouter.get(
  "hr.dashboard",
  "/hr/dashboard",
  hrAuth,
  hrController.dashboard
);

// 4.Define logout route
namedRouter.get("hr.logout", "/hr/logout", hrController.logout);

module.exports = router;
