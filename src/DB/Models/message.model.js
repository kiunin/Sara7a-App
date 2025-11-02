import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      minlength: [2, "Message must be at least 2 character long"],
      maxlength: [500, "Message must be at most 500 character long"],
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const messageModel =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
export default messageModel;
