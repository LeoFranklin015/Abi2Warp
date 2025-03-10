import mongoose from "mongoose";

const abiSchema = new mongoose.Schema(
  {
    abi: {
      type: JSON,
      required: true,
    },
    contractAddress: {
      type: String,
      required: true,
      unique: true,
    },
    txHash: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const AbiModel = mongoose.model("abi", abiSchema);
