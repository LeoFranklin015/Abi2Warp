import mongoose from "mongoose";

const warpSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  warp: {
    type: JSON,
    required: true,
  },
  txHash: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const WarpModel = mongoose.model("warp", warpSchema);
