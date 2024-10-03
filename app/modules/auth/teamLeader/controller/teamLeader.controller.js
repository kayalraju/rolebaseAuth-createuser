// 3rd-party module
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// import model
const UserModel = require("../../admin/model/admin.model");

// import repositories
const adminRepo = require("../../admin/repositories/admin.repositories");

// Define Manager Controleler
class TeamLeaderController {
  // 1.Define Employee Login controller method
  async teamLeaderLogin(req, res) {
    // 1. Check validation of register request
    const errors = validationResult(req);

    // 1b. Check if errors is not empty, then  return error
    if (!errors.isEmpty()) {
      req.flash("error", "Validation Errors");
      return res.redirect("/team-leader/login");
    }

    try {
      // 2. Destructure email and password from the incoming request body
      const { email, password } = req.body;

      // 3. Check user, if email is already register or not
      const existingUser = await adminRepo.checkUserByEmailRepo({ email });
      if (!existingUser) {
        req.flash("Account not found. Plesae connect with Administrator");
        return res.redirect("/team-leader/login");
      }

      // Check if the user has the employee or admin role
      if (
        existingUser.role !== "team-leader" &&
        existingUser.role !== "admin"
      ) {
        req.flash(
          "error",
          "You do not have permission to access the employee account"
        );
        return res.redirect("/team-leader/login");
      }

      // 5. Compare the password with the hash password so that we can match the password at the time of login
      const adminUser = new UserModel(); // Call the model for using validPassword method
      const matchPassword = await adminUser.validPassword(
        password,
        existingUser.password // pass the user password which is already hashed
      );

      // 6. If password is not match the send the message "Invalid Password", otherwise execute the below code
      if (!matchPassword) {
        req.flash("error", "Invalid password");
        return res.redirect("/team-leader/login");
      }

      // 7. Generate token at successfull login of user. Token will generate at the time of login
      const token = jwt.sign(
        {
          // At the time of creating token, below info will add into token and create token in hash form
          id: existingUser._id,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          role: existingUser.role,
          email: existingUser.email,
        },
        process.env.JWT_SECRET_KEY_ALL_USER,
        { expiresIn: "1h" } // Valid 1 hrs
      );

      // 8. If token not generated then user will not logged in, otherwise he/she will be login
      if (!token) {
        req.flash("error", "Invalid Credentials");
        return res.redirect("/team-leader/login");
      }

      // Store the token in a cookie
      res.cookie("tl_token", token, {
        httpOnly: true,
        maxAge: 240000, // 4 minutes
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "strict", // Protect against CSRF
      });

      // Role check
      if (
        existingUser.role === "team-leader" &&
        existingUser.role !== "admin"
      ) {
        // Verified the user
        existingUser.isVerified = true;

        // Save the updated user
        await existingUser.save();

        // Send response
        req.flash("success_msg", "Employee Login successfully");
        return res.redirect("/team-leader/dashboard");
      }
    } catch (error) {
      req.flash("error", error.message);
      return res.redirect("/team-leader/login");
    }
  }

  // 2. Define Employee login page
  async teamLeaderLoginPage(req, res) {
    try {
      res.render("auth/teamLeader/views/login.ejs", {
        title: "Team Leader Login",
        messages: req.flash(),
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred");
    }
  }

  // 3.Define Employee Dashboard
  async dashboard(req, res) {
    try {
      res.render("auth/teamLeader/views/dashboard.ejs", {
        title: "Team Leader Dashboard",
        firstName: req.teamLeader.firstName,
        lastName: req.teamLeader.lastName,
        role: req.teamLeader.role,
      });
    } catch (error) {
      console.log(error);
    }
  }

  // 4. Define logout controller method
  async logout(req, res) {
    res.clearCookie("tl_token");
    req.flash("success_msg", "Logout successfully");
    return res.redirect("/team-leader/login");
  }
}

module.exports = new TeamLeaderController();
