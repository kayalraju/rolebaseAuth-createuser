// 3rd-party module
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const crypto = require("crypto");

// import model
const UserModel = require("../model/admin.model");

// import repositories
const adminRepo = require("../repositories/admin.repositories");

// import others
const { removeUploadedFile } = require("../../../../middleware/multer");
const {
  transport,
  sendVerificationEmail,
} = require("../../../../helper/mailer");
const {
  handleRegistrationVerification,
} = require("../../../../helper/emailVerificationUtils");
const getProfileImagePath = require("../../../../helper/getProfileImage");

class AdminUserController {
  // 1.Define Admin registration controller method
  async adminRegistration(req, res) {
    // 1. Check validation of register request
    const errors = validationResult(req);

    // 1b. Check if errors is not empty, then first unlink the uploaded image and return error
    if (!errors.isEmpty()) {
      // 1. If validation is failed, then no uploaded file (which is coming from incoming request body) added in the upload directory
      if (req.file) {
        await removeUploadedFile(req.file.path);
      }

      // 2. Return the Error
      req.flash("error", "Validation Errors");
      return res.redirect("/admin/registration");
    }

    try {
      // 2. Destructure the data fron the incoming request body
      const { firstName, lastName, email, password } = req.body;

      // 3. Check admin, if email is already register or not
      const existingUser = await adminRepo.checkUserByEmailRepo({ email });

      // 3b. If admin user already register, then send the "admin already register" message, otherwise execute below code
      if (existingUser) {
        // 1. If email is already exist, then no uploaded file (which is coming from incoming request body) added in the upload directory
        if (req.file) {
          await removeUploadedFile(req.file.path);
        }

        // 2. response sent to the client
        req.flash("error", "Sorry, admin already exists with this email");
        return res.redirect("/admin/registration");
      }

      // 4. Initialize user data into another variable
      let adminUserData = {
        firstName,
        lastName,
        email,
        password,
      };

      // 5. Password Hash
      const adminUser = new UserModel(); // Call the user model for using passwordHashing mehtod
      const hashPassword = await adminUser.generateHashPassword(password); // Hash the password
      adminUserData.password = hashPassword; // update the Password in userData variable

      // 6. Define file upload --> If there's a file, add its path to the userData. Store the profile image in a variable
      if (req.file) {
        adminUserData.profileImage = req.file.path;
      }
      // 7. Call the registerUserRepo method to create user registration
      const result = await adminRepo.registerRepo(adminUserData);

      // 8. Return the response to the client
      if (!(result && result._id)) {
        req.flash("error", "User registration failed");
        return res.redirect("/admin/registration");
      } else {
        // 1. Call the create crypto token repo method so that token is create in the database for email verification
        const savedToken = await adminRepo.createTokenRepo(
          result._id,
          "registration" // pass the token type
        ); // Pass the user Id

        // 2. Set up email transport
        const senderEmail = process.env.SENDER_EMAIL;
        const emailPassword = process.env.EMAIL_PASSWORD;
        const transporter = transport(senderEmail, emailPassword); // set-up email server

        // 3. Define mail template or mail options
        const mailOptions = {
          from: `"" <${process.env.SENDER_EMAIL}>`, // Professional format for sender
          to: result.email,
          subject: "Action Required: Verify Your Account",
          html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <h2 style="color: #333;">Hello ${adminUserData.firstName} ${adminUserData.lastName},</h2>
      <p style="color: #555; font-size: 16px;">
        Thank you for registering with <strong - Where Trends Are Bornstrong>eShop - Where Trends Are Born</strong>. To complete your registration, please verify your account by clicking the button below:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.BASE_URL}/admin/confirmation/${result._id}/${result.email}/${savedToken.token}/${savedToken.type}" 
           style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; font-size: 16px; border-radius: 5px;">
           Verify Account
        </a>
      </div>
      <p style="color: #555; font-size: 14px;">
        Or copy and paste this link into your browser:
      </p>
      <p style="word-wrap: break-word; color: #555;">
      ${process.env.BASE_URL}/admin/confirmation/${result._id}/${result.email}/${savedToken.token}/${savedToken.type}
      </p>
      <p style="color: #555; font-size: 14px;">
        If you didn’t create an account with us, please ignore this email.
      </p>
      <p style="color: #333; font-size: 16px;">
        Thank you,<br/>
        <strong>eShop - Where Trends Are Born</strong> Team
      </p>
      <hr style="border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        This is an automated message, please do not reply to this email.
      </p>
    </div>
  `,
        };

        // 4. Send the verification email
        const emailResponse = await sendVerificationEmail(
          req,
          res,
          transporter,
          mailOptions
        );

        // 5. Sending response to the client
        if (emailResponse.status) {
          req.flash(
            "success",
            "User registration successful. A verification link has been sent to your registered email address. Please verify within 2 minutes"
          );
          return res.redirect("/admin/registration");
        }
      }
    } catch (error) {
      console.error(error);
      req.flash("error", "An error occurred during registration");
      return res.redirect("/admin/registration");
    }
  }

  // 2.Define Admin registration page and render
  async adminRegistrationPage(req, res) {
    try {
      res.render("auth/admin/views/register.ejs", {
        title: "Admin Registration",
        messages: req.flash(),
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred");
    }
  }

  // 3. Define registation email verification controller method
  async verifyEmail(req, res) {
    // 1. Check validation of verifyEmail request
    const errors = validationResult(req);
    // 1b. Check if errors is not empty, then return error
    if (!errors.isEmpty()) {
      req.flash(
        "error",
        "Validation Errors: " +
          errors
            .array()
            .map((e) => e.msg)
            .join(", ")
      );
      return res.redirect("/admin/login");
    }

    try {
      // 2. Destructure the email, token, and type from request params
      const { id, email, token, type } = req.params;

      // 3. Find user by email (checking both email and newEmail fields)
      let existingUser =
        (await adminRepo.checkUserByEmailRepo({ email })) ||
        (await adminRepo.checkUserByNewEmailRepo({ newEmail: email }));

      // 4. If existing user is not available in the data, then user is not registered
      if (!existingUser) {
        req.flash(
          "error",
          "User not found. Please register or check your email."
        );
        return res.redirect("/admin/login");
      }

      // 5. Find token in the database based on userId
      const savedToken = await adminRepo.findToken({
        _userId: existingUser._id,
        token,
        type,
      });

      // 6. If the verification token is not available, then token is invalid or expired
      if (!savedToken) {
        req.flash(
          "error",
          "Invalid or expired token. Please request a new verification link."
        );
        return res.redirect("/admin/login");
      }

      // 7. Handle different token verification types
      switch (type) {
        case "registration":
          await handleRegistrationVerification(existingUser, savedToken, res);
          req.flash(
            "success",
            "Email successfully verified! You can now login."
          );
          return res.redirect("/admin/login");

        default:
          req.flash("error", "Invalid verification type");
          return res.redirect("/admin/login");
      }
    } catch (error) {
      console.error("Email verification error:", error);
      req.flash(
        "error",
        "An error occurred during email verification. Please try again."
      );
      return res.redirect("/admin/login");
    }
  }

  // 4.Define Admin Login controller method
  async adminLogin(req, res) {
    // 1. Check validation of register request
    const errors = validationResult(req);

    // 1b. Check if errors is not empty, then  return error
    if (!errors.isEmpty()) {
      req.flash("error", "Validation Errors");
      return res.redirect("/admin/login");
    }

    try {
      // 2. Destructure email and password from the incoming request body
      const { email, password } = req.body;

      // 3. Check user, if email is already register or not
      const existingUser = await adminRepo.checkUserByEmailRepo({ email });
      if (!existingUser) {
        req.flash("error", "You are not registered. Please register yourself");
        return res.redirect("/admin/login");
      }

      // Check if the user has the admin role
      if (existingUser.role !== "admin") {
        req.flash(
          "error",
          "You do not have permission to access the admin account"
        );
        return res.redirect("/admin/login");
      }

      // 4. Check if the user is already verified or not
      if (!existingUser.isVerified) {
        req.flash(
          "error",
          "You are not a verified user. Please verify yourself before login"
        );
        return res.redirect("/admin/login");
      }

      // 5. Compare the password with the hash password so that we can match the password at the time of login
      const user = new UserModel(); // Call the model for using validPassword method
      const matchPassword = await user.validPassword(
        password,
        existingUser.password // pass the user password which is already hashed
      );

      // 6. If password is not match the send the message "Invalid Password", otherwise execute the below code
      if (!matchPassword) {
        req.flash("error", "Invalid password");
        return res.redirect("/admin/login");
      }

      // 7. Generate token at successfull login of user. Token will generate at the time of login
      const token = jwt.sign(
        {
          // At the time of creating token, below info will add into token and create token in hash form
          id: existingUser._id,
          name: existingUser.fullName,
          email: existingUser.email,
          profileImage: existingUser.profileImage, // Include profile image path in the token
          role: existingUser.role,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1h" } // Valid 1 hrs
      );

      // 8. If token not generated then user will not logged in, otherwise he/she will be login
      if (!token) {
        req.flash("error", "Invalid Credentials");
        return res.redirect("/admin/login");
      } else {
        // Store the token in a cookie
        res.cookie("admin_token", token, {
          httpOnly: true,
          maxAge: 240000, // 4 minutes
          secure: process.env.NODE_ENV === "production", // Use secure cookies in production
          sameSite: "strict", // Protect against CSRF
        });

        // Redirect to the admin dashboard
        req.flash("success", "Login successful");
        return res.redirect("/admin");
      }
    } catch (error) {
      req.flash("error", error.message);
      return res.redirect("/admin/login");
    }
  }

  // 5.Define Login page and render
  async adminLoginPage(req, res) {
    try {
      res.render("auth/admin/views/login.ejs", {
        title: "Admin login",
        messages: req.flash(),
      });
    } catch (error) {
      console.log(error);
    }
  }

  // 6.Define Admin Dashboard Page
  async dashboard(req, res) {
    try {
      // const users = await userModel.find({});
      res.render("auth/admin/views/dashboard.ejs", {
        title: "Admin dashboard",
        profileImage: await getProfileImagePath(req.admin.profileImage),
        role: req.admin.role,
      });
    } catch (error) {
      console.log(error);
    }
  }

  // 7.Define Create User Page
  async addUserPage(req, res) {
    try {
      res.render("auth/admin/views/addUser.ejs", {
        title: "Create New User",
        profileImage: await getProfileImagePath(req.admin.profileImage),
        role: req.admin.role,
        messages: req.flash(), // Pass the flash messages to the template
      });
    } catch (error) {
      console.log(error);
    }
  }

  // 7b. Define Create user controller method
  async inserNewUser(req, res) {
    // 1. Check validation of register request
    const errors = validationResult(req);

    // 1b. Check if errors is not empty, then  return error
    if (!errors.isEmpty()) {
      req.flash("error", "Validation Errors");
      return res.redirect("/admin/add-user");
    }
    try {
      const { firstName, lastName, email, role } = req.body;

      // Check if user already exists
      const existingUser = await adminRepo.checkUserByEmailRepo({ email });

      // 3b. If admin user already register, then send the "admin already register" message, otherwise execute below code
      if (existingUser) {
        // 1. If email is already exist, then no uploaded file (which is coming from incoming request body) added in the upload directory
        if (req.file) {
          await removeUploadedFile(req.file.path);
        }

        // 2. response sent to the client
        req.flash("User with this email already exists");
        return res.redirect("/admin/registration");
      }

      // Initialize user data into another variable
      let createUser = {
        firstName,
        lastName,
        email,
        role,
      };

      // Create a random Password by using crypto
      const randomPassword = crypto.randomBytes(4).toString("hex");

      // Password Hash
      const adminUser = new UserModel(); // Call the user model for using passwordHashing mehtod
      const hashPassword = await adminUser.generateHashPassword(randomPassword); // Hash the password
      createUser.password = hashPassword; // update the Password in userData variable

      // Define file upload --> If there's a file, add its path to the userData. Store the profile image in a variable
      if (req.file) {
        createUser.profileImage = req.file.path;
      }

      // Call the registerUserRepo method to create user registration
      const result = await adminRepo.registerRepo(createUser);

      if (!result) {
        throw new Error("Failed to create user in the database");
      }

      // Send email with login credentials
      // Set up email transport
      const senderEmail = process.env.SENDER_EMAIL;
      const emailPassword = process.env.EMAIL_PASSWORD;
      const transporter = transport(senderEmail, emailPassword); // set-up email server

      // Login Link
      const loginLink = `${process.env.BASE_URL}/${createUser.role}/login`;

      // Define mail template or mail options
      const mailOptions = {
        from: `"eShop - Where Trends Are Born" <${process.env.SENDER_EMAIL}>`, // Professional format for sender
        to: createUser.email,
        subject: "Your eShop Account Credentials",
        html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <h2 style="color: #333;">Welcome ${createUser.firstName} ${
          createUser.lastName
        },</h2>
      <p style="color: #555; font-size: 16px;">
        Your account has been successfully created by our administrator. You can now log in and explore <strong>eShop - Where Trends Are Born</strong>. Below are your login credentials:
      </p>
      <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border: 1px solid #ddd; border-radius: 5px;">
        <p style="color: #333; font-size: 16px;"><strong>Email:</strong> ${
          createUser.email
        }</p>
        <p style="color: #333; font-size: 16px;"><strong>Temporary Password:</strong> ${randomPassword}</p>
      </div>
      <p style="color: #555; font-size: 16px;">
        To log in, click the button below or use the following link:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginLink}" 
           style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; font-size: 16px; border-radius: 5px;">
           Log In to Your Account
        </a>
      </div>
      <p style="word-wrap: break-word; color: #555; font-size: 14px;">
        ${req.protocol}://${req.get("host")}/${createUser.role}/login
      </p>
      <p style="color: #555; font-size: 16px;">
        For security reasons, please make sure to update your password after logging in.
      </p>
      <p style="color: #555; font-size: 14px;">
        If you didn’t request this account, please contact our support team immediately.
      </p>
      <p style="color: #333; font-size: 16px;">
        Thank you,<br/>
        <strong>eShop - Where Trends Are Born</strong> Team
      </p>
      <hr style="border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        This is an automated message, please do not reply to this email.
      </p>
    </div>
  `,
      };

      // Send the verification email
      const emailResponse = await sendVerificationEmail(
        req,
        res,
        transporter,
        mailOptions
      );

      // Sending response to the client
      if (emailResponse.status) {
        req.flash(
          "success",
          "User created successfully and login credentials sent to email"
        );
        res.redirect("/admin/add-user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      req.flash("error", "An error occurred while creating the user");
      res.redirect("/admin/add-user");
    }
  }

  // 8. Define logout controller method
  async logout(req, res) {
    res.clearCookie("admin_token");
    req.flash("success_msg", "Logout successfully");
    return res.redirect("/admin/login");
  }
}

module.exports = new AdminUserController();
