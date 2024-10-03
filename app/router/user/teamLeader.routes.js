// 3rd-party module
const express = require("express");
const routeLabel = require("route-label");

// import controller
const teamLeaderController = require("../../modules/auth/teamLeader/controller/teamLeader.controller");

// import others
const { loginValidator } = require("../../helper/validation");
const { teamLeaderAuth } = require("../../middleware/auth");

// Initialize Express Router for creating router object
const router = express.Router();

// Wrap the express router with route-label package
const namedRouter = routeLabel(router);

// 1.Define Employee Login API route
namedRouter.post(
  "team-leader.login",
  "/team-leader/login",
  loginValidator,
  teamLeaderController.teamLeaderLogin
);

// 2.Define Employee Login Page route
namedRouter.get(
  "team-leader.login-page",
  "/team-leader/login",
  teamLeaderController.teamLeaderLoginPage
);

// 3.Defie Dashboard route
namedRouter.get(
  "team-leader.dashboard",
  "/team-leader/dashboard",
  teamLeaderAuth,
  teamLeaderController.dashboard
);

// 4.Define logout route
namedRouter.get(
  "team-leader.logout",
  "/team-leader/logout",
  teamLeaderController.logout
);

module.exports = router;
