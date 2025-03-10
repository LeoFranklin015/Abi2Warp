import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { AbiModel } from "./models/abi";
import { WarpModel } from "./models/warps";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/warps-indexer")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error: Error) => {
    console.error("MongoDB connection error:", error);
  });

// POST endpoint to insert a new warp
app.post("/api/abis", async (req: Request, res: Response) => {
  try {
    const abi = new AbiModel(req.body);
    await abi.save();
    res.status(201).json(abi);
  } catch (error: unknown) {
    console.error("Error creating abi   :", error);
    res.status(500).json({ error: "Error creating abi" });
  }
});

// GET endpoint to retrieve all warps
app.get("/api/abis/:contractAddress", async (_req: Request, res: Response) => {
  try {
    const abi = await AbiModel.findOne({
      contractAddress: _req.params.contractAddress,
    });
    if (abi) {
      res.json(abi);
    } else {
      res.status(404).json({ error: "ABI not found" });
    }
  } catch (error: unknown) {
    console.error("Error fetching abis:", error);
    res.status(500).json({ error: "Error fetching abis" });
  }
});

app.get("/api/warps/:address", async (_req: Request, res: Response) => {
  try {
    const warp = await WarpModel.find({ address: _req.params.address });
    res.json(warp);
  } catch (error: unknown) {
    console.error("Error fetching warps:", error);
    res.status(500).json({ error: "Error fetching warps" });
  }
});

app.post("/api/warps", async (req: Request, res: Response) => {
  try {
    const warp = new WarpModel(req.body);
    await warp.save();
    res.status(201).json(warp);
  } catch (error: unknown) {
    console.error("Error creating warp:", error);
    res.status(500).json({ error: "Error creating warp" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
