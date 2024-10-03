const jwt = require("jsonwebtoken");

// Define Admin Authentication
const adminAuth = (req, res, next) => {
  if (req.cookies && req.cookies.admin_token) {
    jwt.verify(
      req.cookies.admin_token,
      process.env.JWT_SECRET_KEY,
      (err, data) => {
        if (!err) {
          req.admin = data;
          next();
        } else {
          req.flash("error_msg", "you need to login first!!");
          res.redirect("/admin/login");
        }
      }
    );
  } else {
    console.log("admin cookie data not found");
    req.flash("error_msg", "you need to login first!!");
    res.redirect("/admin/login");
  }
};

// Define Manager Authentication
const managerAuth = (req, res, next) => {
  if (req.cookies && req.cookies.manager_token) {
    jwt.verify(
      req.cookies.manager_token,
      process.env.JWT_SECRET_KEY_ALL_USER,
      (err, data) => {
        if (!err) {
          req.manager = data;
          next();
        } else {
          req.flash("error_msg", "please login first");
          res.redirect("/manager/login");
        }
      }
    );
  } else {
    console.log("manager cookie data not found");
    req.flash("error_msg", "please login first");
    res.redirect("/manager/login");
  }
};

// Define HR Authentication
const hrAuth = (req, res, next) => {
  if (req.cookies && req.cookies.hr_token) {
    jwt.verify(
      req.cookies.hr_token,
      process.env.JWT_SECRET_KEY_ALL_USER,
      (err, data) => {
        if (!err) {
          req.hr = data;
          next();
        } else {
          req.flash("error_msg", "you need to login first!!");
          res.redirect("/hr/login");
        }
      }
    );
  } else {
    console.log("hr cookie data not found");
    req.flash("error_msg", "you need to login first!!");
    res.redirect("/hr/login");
  }
};

// Define HR Authentication
const employeeAuth = (req, res, next) => {
  if (req.cookies && req.cookies.emp_token) {
    jwt.verify(
      req.cookies.emp_token,
      process.env.JWT_SECRET_KEY_ALL_USER,
      (err, data) => {
        if (!err) {
          req.employee = data;
          next();
        } else {
          req.flash("error_msg", "you need to login first!!");
          res.redirect("/employee/login");
        }
      }
    );
  } else {
    console.log("Employee cookie data not found");
    req.flash("error_msg", "you need to login first!!");
    res.redirect("/employee/login");
  }
};

// Define Team Leader Authentication
const teamLeaderAuth = (req, res, next) => {
  if (req.cookies && req.cookies.tl_token) {
    jwt.verify(
      req.cookies.tl_token,
      process.env.JWT_SECRET_KEY_ALL_USER,
      (err, data) => {
        if (!err) {
          req.teamLeader = data;
          next();
        } else {
          req.flash("error_msg", "you need to login first!!");
          res.redirect("/team-leader/login");
        }
      }
    );
  } else {
    console.log("Team Leader cookie data not found");
    req.flash("error_msg", "you need to login first!!");
    res.redirect("/team-leader/login");
  }
};

// Define Team Leader Authentication
const officeBoyAuth = (req, res, next) => {
  if (req.cookies && req.cookies.officeBoy_token) {
    jwt.verify(
      req.cookies.officeBoy_token,
      process.env.JWT_SECRET_KEY_ALL_USER,
      (err, data) => {
        if (!err) {
          req.officeBoy = data;
          next();
        } else {
          req.flash("error_msg", "you need to login first!!");
          res.redirect("/office-boy/login");
        }
      }
    );
  } else {
    console.log("Team Leader cookie data not found");
    req.flash("error_msg", "you need to login first!!");
    res.redirect("/office-boy/login");
  }
};

module.exports = {
  adminAuth,
  managerAuth,
  hrAuth,
  employeeAuth,
  teamLeaderAuth,
  officeBoyAuth,
};
