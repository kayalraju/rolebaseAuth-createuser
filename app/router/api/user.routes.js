// 3rd-party module
const express = require("express");
const routeLabel = require("route-label");

// import others

// Initialize Express Router for creating router object
const router = express.Router();

// Wrap the express router with route-label package
const namedRouter = routeLabel(router);

module.exports = router;
