import mongoose from "mongoose";

const onlinePaymentSchema = new mongoose.Schema(
  {
    totalSale: {
      type: Number,
      required: [true, "Total sale amount is required"],
      min: [0, "Total sale cannot be negative"],
    },
    onlinePayment: {
      type: Number,
      required: [true, "Online received amount is required"],
      min: [0, "Online payment cannot be negative"],
    },
    notes: {  // optional field agar future mein chahiye
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

onlinePaymentSchema.index({ adminId: 1, createdAt: -1 });

const OnlinePayment = mongoose.model("OnlinePayment", onlinePaymentSchema);

export default OnlinePayment;