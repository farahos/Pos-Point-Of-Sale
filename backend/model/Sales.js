import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  // Product Information
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  
  // Sales Type
  saleType: {
    type: String,
    enum: ["unit", "kg", "case"],
    required: true
  },
  
  // Quantity based on sale type
  quantity: {
    type: Number,
    required: true,
    min: 0.01
  },
  
  // Calculated fields
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  
  // Customer Information (Updated)
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },
  
  // Sales info
  saleDate: { type: Date, default: Date.now },
  
  // Payment info (Updated for credit)
  paymentMethod: {
    type: String,
    enum: ["cash", "card", "mobile_money", "credit"],
    required: true
  },
  
  paymentStatus: {
    type: String,
    enum: ["paid", "pending", "partial", "cancelled"],
    default: "paid"
  },
  
  // Credit specific fields
  creditAmount: { type: Number, default: 0 }, // Amount paid by credit
  paidAmount: { type: Number, default: 0 }, // Amount paid in cash/other
  remainingAmount: { type: Number, default: 0 }, // Remaining balance
  
  // Installment plan for credit sales
  installmentPlan: {
    totalInstallments: { type: Number, default: 1 },
    currentInstallment: { type: Number, default: 1 },
    installmentAmount: { type: Number, default: 0 },
    dueDate: { type: Date }
  },
  
  // Sales person info
  salesPerson: { type: String, default: "System" },
  
  // Reference and notes
  invoiceNumber: { type: String, unique: true },
  notes: { type: String },
  
  // Auto-calculated fields
  unitsSold: { type: Number },
  kgSold: { type: Number },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate invoice number before save
saleSchema.pre("save", async function(next) {
  if (!this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    
    const count = await mongoose.models.Sale.countDocuments({
      saleDate: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lte: new Date(date.setHours(23, 59, 59, 999))
      }
    });
    
    this.invoiceNumber = `INV-${year}${month}${day}-${(count + 1).toString().padStart(4, "0")}`;
  }
  
  // Calculate credit and remaining amounts
  if (this.paymentMethod === "credit") {
    this.creditAmount = this.totalPrice;
    this.paidAmount = 0;
    this.remainingAmount = this.totalPrice;
    this.paymentStatus = "pending";
  } else {
    this.paidAmount = this.totalPrice;
    this.remainingAmount = 0;
    this.paymentStatus = "paid";
  }
  
  next();
});

// Update stock and customer credit after sale
saleSchema.post("save", async function(doc) {
  const Product = mongoose.model("Product");
  const Customer = mongoose.model("Customer");
  
  // Update product stock
  const product = await Product.findById(doc.product);
  if (product) {
    let stockUnits = product.stockUnits;
    let stockKg = product.stockKg;
    
    switch (doc.saleType) {
      case "unit":
        stockUnits -= doc.quantity;
        break;
      case "kg":
        stockKg -= doc.quantity;
        break;
      case "case":
        stockUnits -= doc.quantity * product.unitsPerCase;
        stockKg -= doc.quantity * product.kgPerCase;
        break;
    }
    
    stockUnits = Math.max(0, stockUnits);
    stockKg = Math.max(0, stockKg);
    
    await Product.findByIdAndUpdate(doc.product, {
      stockUnits,
      stockKg,
      updatedAt: Date.now()
    });
  }
  
  // Update customer credit and history
  const customer = await Customer.findById(doc.customer);
  if (customer) {
    await customer.addSale(doc._id);
    await customer.updateLastPurchase();
    
    if (doc.paymentMethod === "credit") {
      await customer.addCreditPurchase(doc.totalPrice);
    }
  }
});

// Restore stock and credit if sale is cancelled
saleSchema.pre("findOneAndUpdate", async function(next) {
  const update = this.getUpdate();
  
  if (update.paymentStatus === "cancelled") {
    const sale = await this.model.findOne(this.getQuery());
    
    if (sale && sale.paymentStatus !== "cancelled") {
      const Product = mongoose.model("Product");
      const Customer = mongoose.model("Customer");
      
      // Restore product stock
      const product = await Product.findById(sale.product);
      if (product) {
        let stockUnits = product.stockUnits;
        let stockKg = product.stockKg;
        
        switch (sale.saleType) {
          case "unit":
            stockUnits += sale.quantity;
            break;
          case "kg":
            stockKg += sale.quantity;
            break;
          case "case":
            stockUnits += sale.quantity * product.unitsPerCase;
            stockKg += sale.quantity * product.kgPerCase;
            break;
        }
        
        await Product.findByIdAndUpdate(sale.product, {
          stockUnits,
          stockKg
        });
      }
      
      // Restore customer credit
      if (sale.paymentMethod === "credit") {
        const customer = await Customer.findById(sale.customer);
        if (customer) {
          customer.currentCredit = Math.max(0, customer.currentCredit - sale.totalPrice);
          await customer.save();
        }
      }
    }
  }
  next();
});

export default mongoose.model("Sale", saleSchema);