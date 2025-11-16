import mongoose from "mongoose";

export const genderEnum = {
  MALE: "MALE",
  FEMALE: "FEMALE",
};

export const providerEnum = {
  SYSTEM: "SYSTEM",
  GOOGLE: "GOOGLE",
};

export const roleEnum = {
  USER: "USER",
  ADMIN: "ADMIN",
};

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: [2, "First name must be at least 2 characters long"],
      maxLength: [20, "First name must be at most 20 characters long"],
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Last name must be at least 2 characters long"],
      maxlength: [20, "Last name must be at most 20 characters long"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return providerEnum.GOOGLE ? false : true;
      },
    },
    gender: {
      type: String,
      enum: {
        values: Object.values(genderEnum),
        message: "{VALUE} is not a valid entry",
      },
    },
    provider: {
      type: String,
      enum: {
        values: Object.values(providerEnum),
        message: "{VALUE} is not a valid entry",
      },
      default: providerEnum.SYSTEM,
    },
    role: {
      type: String,
      enum: {
        values: Object.values(roleEnum),
        message: "{VALUE} is not a valid entry",
      },
      default: roleEnum.USER,
    },
    phone: String,
    profilePhoto: String,
    coverPhoto: [String],
    cloudProfilePhoto: { public_id: String, secure_url: String },
    cloudCoverPhoto: [{ public_id: String, secure_url: String }],
    confirmEmail: Date,
    confirmEmailOtp: String,
    confirmEmailOtpCreatedAt: Date,
    forgetPasswordOtp: String,
    resetPasswordcreatedAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

userSchema.virtual("messages", {
  ref: "Message",
  localField: "_id",
  foreignField: "receiverId",
});

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
