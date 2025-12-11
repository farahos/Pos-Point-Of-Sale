import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },

  pricePerUnit: { type: Number, required: true },
  pricePerKg: { type: Number, required: true },
  pricePerCase: { type: Number, required: true },

  unitsPerCase: { type: Number, required: true },
  kgPerCase: { type: Number, required: true },

  stockUnits: { type: Number, default: 0 },
  stockKg: { type: Number, default: 0 },
});

export default mongoose.model("Product", productSchema);
