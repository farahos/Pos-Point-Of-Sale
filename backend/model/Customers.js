import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  // Basic Information
  customerName: {
    type: String,
    required: [true, "Customer name is required"],
    trim: true
  },
  
  customerPhone: {
    type: String,
    required: [true, "Phone number is required"],
    unique: true,
    trim: true
  },
  
  customerAddress: {
    type: String,
    required: [true, "Address is required"],
    trim: true
  },
  
  // Guarantee Information
  guaranteeName: {
    type: String,
    trim: true
  },
  
  guaranteePhone: {
    type: String,
    trim: true
  },
  
  // Credit Information
  creditLimit: {
    type: Number,
    default: 0,
    min: 0
  },
  
  currentCredit: {
    type: Number,
    default: 0,
    min: 0
  },
  
  creditBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Status and Dates
  status: {
    type: String,
    enum: ["active", "suspended", "blocked"],
    default: "active"
  },
  
  registrationDate: {
    type: Date,
    default: Date.now
  },
  
  lastPurchaseDate: {
    type: Date
  },
  
  // Additional Info
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  
  notes: {
    type: String,
    trim: true
  },
  
  // Sales Reference
  salesHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sale"
  }],
  
  // Payment History
  paymentHistory: [{
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    description: { type: String },
    paymentMethod: { type: String },
    reference: { type: String }
  }]
}, {
  timestamps: true
});

// Calculate credit balance (creditLimit - currentCredit)
customerSchema.virtual("availableCredit").get(function() {
  return Math.max(0, this.creditLimit - this.currentCredit);
});

// Update last purchase date
customerSchema.methods.updateLastPurchase = function() {
  this.lastPurchaseDate = Date.now();
  return this.save();
};

// Add sale to customer history
customerSchema.methods.addSale = function(saleId) {
  this.salesHistory.push(saleId);
  return this.save();
};

// Add credit purchase
customerSchema.methods.addCreditPurchase = function(amount) {
  this.currentCredit += amount;
  this.creditBalance += amount;
  return this.save();
};

// Add payment
customerSchema.methods.addPayment = function(paymentData) {
  this.paymentHistory.push(paymentData);
  this.currentCredit = Math.max(0, this.currentCredit - paymentData.amount);
  return this.save();
};

// Indexes for better performance
customerSchema.index({ customerName: 1 });
customerSchema.index({ customerPhone: 1 });
customerSchema.index({ status: 1 });

export default mongoose.model("Customer", customerSchema);