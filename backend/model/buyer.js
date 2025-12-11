import mongoose from "mongoose";

const buyerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phone: String,
  requestedProduct: String,
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'seller', required: true },
}, 
{ timestamps: true });

const buyer = mongoose.model("buyer", buyerSchema);
export default buyer;