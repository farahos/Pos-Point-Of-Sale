import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    rate: {
      type: String,
      required: true,
      trim: true,
    },
    samiga: {
      type: Number,
      required: true,
      trim: true,
    },
      value: {
      type: Number,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Available","Pending",  "Sold"],
      default: "Available",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin/user ID
    },
  },
  {
    timestamps: true, // createdAt & updatedAt otomaatig ah
  }
);

const seller = mongoose.model("seller", sellerSchema);
export default seller;
