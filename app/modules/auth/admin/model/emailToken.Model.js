// 3rd-party moduel
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define token Schema for Email verification
const tokenSchema = new Schema(
  {
    _userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    token: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["registration", "email_update", "forgot_password"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: {
        expires: 180, // 180 seconds = 3min
      },
    },
  },
  {
    versionKey: false,
  }
);

const TokenModel = new mongoose.model("token", tokenSchema);
module.exports = TokenModel;
