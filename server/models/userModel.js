const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  avatar: {
    type: {
      url: String,
      localPath: String,
    },
    default: {
      url: `https://img.icons8.com/?size=160&id=diYijhqFrY_u&format=png`,
      localPath: "",
    },
  },
  username: {
    type: String,
    lowercase: true,
    trim: true,
    index: true,
  },
  role: {
    type: String,
    // required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  otpHash: {
    type: String,
  },
  loginType: {
    type: String,
    default: "email_password", // Set your default login type if needed
  },
  isNumberVerified: {
    type: Boolean,
    default: false,
  },
  bio: {
    type: String,
  }
},
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);
