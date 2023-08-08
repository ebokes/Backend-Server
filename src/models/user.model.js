const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "firstName must be Provided"],
      trim: true,
      match: [/^\w+$/, "Please enter a valid firstName"],
    },
    lastName: {
      type: String,
      required: [true, "lastName must be Provided"],
      trim: true,
      match: [/^\w+$/, "Please enter a valid lastName"],
    },

    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"],
    },
    hasPaid: {
      type: Number,
      default: 0,
    },
    isEmailActive: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
      match: /[0-9]{10}/
    },
    picture: {
      type: Array,
    },
    replies: {
      type: Array,
    },
    comments: {
      type: Array,
    },
    roles: {
      type: String,
      enum: ["student", "IT"],
      default: "student",
  },
  courseLimit: {
    type: Number,
    default: 0,
  },
  points: {
    type: mongoose.Decimal128,
    default: 0,
  },
  score: {
    type: mongoose.Decimal128,
    default: 0,
  },
},
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);