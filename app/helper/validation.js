const { check } = require("express-validator");

// For Admin Registration Valdation
exports.adminRegistrationValidator = [
  check("firstName", "First name is required").not().isEmpty().trim(),
  check("lastName", "Last name is required").not().isEmpty().trim(),
  check("email", "Please include a valid email").isEmail().normalizeEmail({
    gmail_lowercase: true,
    gmail_remove_dots: true,
  }),
  check(
    "password",
    "Password must be greater than 6 character and contains at least one uppercase letter, one lowercase letter, one number and one special character"
  ).isStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
  check("profileImage")
    .custom((value, { req }) => {
      const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

      // Check if the file type is one of the allowed image formats
      if (allowedTypes.includes(req.file.mimetype)) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage("Please uploads image only png, jpg, and jpeg formats"),
];

// For verify email validation
exports.verifyEmailAndTokenValidator = [
  check("id").not().isEmpty().withMessage("User Id is required"),
  check("email").isEmail().withMessage("Invalid email format."),
  check("token")
    .isLength({ min: 32, max: 32 })
    .withMessage("Invalid token format."),
  check("type").not().isEmpty().withMessage("Token type is required"),
];

// For login validation
exports.loginValidator = [
  check("email")
    .isEmail()
    .withMessage("Please provide a valid email.")
    .normalizeEmail(),
  check("password")
    .not()
    .isEmpty()
    .isStrongPassword({
      minLength: 6,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be greater than 6 character and contains at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
  ,
];

// For Create user Validator
exports.addUserValidator = [
  check("firstName", "First name is required").not().isEmpty().trim(),
  check("lastName", "Last name is required").not().isEmpty().trim(),
  check("email", "Please include a valid email").isEmail().normalizeEmail({
    gmail_lowercase: true,
    gmail_remove_dots: true,
  }),
  check(
    "password",
    "Password must be greater than 6 character and contains at least one uppercase letter, one lowercase letter, one number and one special character"
  ).isStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
  check("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["manager", "hr", "team-leader", "employee", "office-boy"])
    .withMessage("Invalid role selected"),

  check("profileImage")
    .custom((value, { req }) => {
      const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

      // Check if the file type is one of the allowed image formats
      if (allowedTypes.includes(req.file.mimetype)) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage("Please uploads image only png, jpg, and jpeg formats"),
];
