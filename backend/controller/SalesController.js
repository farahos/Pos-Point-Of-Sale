import Sale from "../model/Sales.js"
import Product from "../model/Products.js"
import Customer from "../model/Customers.js"

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
// Update the createSale function in salesController.js

export const createSale = async (req, res) => {
  try {
    const {
      productId,
      customerId,
      saleType,
      quantity,
      paymentMethod,
      paidAmount,
      notes
    } = req.body;

    // Validate required fields
    if (!productId || !customerId || !saleType || !quantity || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Product, customer, sale type, quantity, and payment method are required"
      });
    }

    // Get product and customer
    const [product, customer] = await Promise.all([
      Product.findById(productId),
      Customer.findById(customerId)
    ]);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    // Check customer status
    if (customer.status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Customer is ${customer.status}. Cannot process sale.`
      });
    }

    // Check stock availability (same as before)
    // ... stock validation code ...

    // Calculate price
    let unitPrice = 0;
    let totalPrice = 0;
    let unitsSold = 0;
    let kgSold = 0;

    switch (saleType) {
      case "unit":
        unitPrice = product.pricePerUnit;
        totalPrice = quantity * unitPrice;
        unitsSold = quantity;
        kgSold = (quantity * product.kgPerCase) / product.unitsPerCase;
        break;
      case "kg":
        unitPrice = product.pricePerKg;
        totalPrice = quantity * unitPrice;
        kgSold = quantity;
        unitsSold = (quantity * product.unitsPerCase) / product.kgPerCase;
        break;
      case "case":
        unitPrice = product.pricePerCase;
        totalPrice = quantity * unitPrice;
        unitsSold = quantity * product.unitsPerCase;
        kgSold = quantity * product.kgPerCase;
        break;
    }

    // For credit sales, validate credit limit
    if (paymentMethod === "credit") {
      const availableCredit = customer.creditLimit - customer.currentCredit;
      
      if (totalPrice > availableCredit) {
        return res.status(400).json({
          success: false,
          message: `Credit limit exceeded. Available credit: $${availableCredit.toFixed(2)}`
        });
      }
    }

    // For partial payments
    const paid = paidAmount || (paymentMethod === "credit" ? 0 : totalPrice);
    const remaining = totalPrice - paid;

    // Create sale
    const sale = await Sale.create({
      product: productId,
      customer: customerId,
      saleType,
      quantity,
      unitPrice,
      totalPrice,
      unitsSold,
      kgSold,
      paymentMethod,
      paidAmount: paid,
      remainingAmount: remaining,
      paymentStatus: remaining > 0 ? "partial" : "paid",
      salesPerson: req.user?.name || "System",
      notes,
      saleDate: new Date()
    });

    // Populate details
    const populatedSale = await Sale.findById(sale._id)
      .populate("product", "name category")
      .populate("customer", "customerName customerPhone");

    res.status(201).json({
      success: true,
      message: "Sale completed successfully",
      data: populatedSale,
      invoiceNumber: sale.invoiceNumber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
export const getSales = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      productId,
      customerName,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    // Date filter
    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) query.saleDate.$lte = new Date(endDate);
    }

    // Product filter
    if (productId) {
      query.product = productId;
    }

    // Customer filter
    if (customerName) {
      query.customerName = { $regex: customerName, $options: "i" };
    }

    const sales = await Sale.find(query)
      .populate("product", "name category pricePerUnit pricePerKg pricePerCase")
      .sort({ saleDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Sale.countDocuments(query);

    // Calculate totals
    const totalSales = await Sale.aggregate([
      { $match: query },
      { $group: { _id: null, totalAmount: { $sum: "$totalPrice" } } }
    ]);

    const totalAmount = totalSales[0]?.totalAmount || 0;

    res.status(200).json({
      success: true,
      count: sales.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalAmount,
      data: sales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("product", "name category pricePerUnit pricePerKg pricePerCase unitsPerCase kgPerCase");

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found"
      });
    }

    res.status(200).json({
      success: true,
      data: sale
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Sale not found"
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Update sale status
// @route   PATCH /api/sales/:id/status
// @access  Private
export const updateSaleStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (!["paid", "pending", "partial", "cancelled"].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status"
      });
    }

    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate("product", "name");

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Sale status updated",
      data: sale
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Sale not found"
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Delete sale
// @route   DELETE /api/sales/:id
// @access  Private
export const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found"
      });
    }

    // Restore stock before deleting
    if (sale.paymentStatus === "paid") {
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
          stockKg,
          updatedAt: Date.now()
        });
      }
    }

    await sale.deleteOne();

    res.status(200).json({
      success: true,
      message: "Sale deleted successfully"
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Sale not found"
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get sales statistics
// @route   GET /api/sales/stats
// @access  Private
export const getSalesStats = async (req, res) => {
  try {
    const { period = "today" } = req.query;
    
    let startDate, endDate = new Date();
    
    switch (period) {
      case "today":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case "yesterday":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "week":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate = new Date(0); // Beginning of time
    }

    // Total sales amount
    const totalStats = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate, $lte: endDate },
          paymentStatus: "paid"
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalPrice" },
          totalSales: { $sum: 1 },
          avgSale: { $avg: "$totalPrice" }
        }
      }
    ]);

    // Sales by product
    const productStats = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate, $lte: endDate },
          paymentStatus: "paid"
        }
      },
      {
        $group: {
          _id: "$product",
          totalAmount: { $sum: "$totalPrice" },
          totalQuantity: { $sum: "$quantity" },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 }
    ]);

    // Populate product names
    const productStatsWithNames = await Sale.populate(productStats, {
      path: "_id",
      select: "name category"
    });

    // Daily sales for chart
    const dailyStats = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate, $lte: endDate },
          paymentStatus: "paid"
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
          amount: { $sum: "$totalPrice" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        total: totalStats[0] || { totalAmount: 0, totalSales: 0, avgSale: 0 },
        topProducts: productStatsWithNames,
        dailySales: dailyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get invoice by number
// @route   GET /api/sales/invoice/:invoiceNumber
// @access  Private
export const getInvoice = async (req, res) => {
  try {
    const sale = await Sale.findOne({ invoiceNumber: req.params.invoiceNumber })
      .populate("product", "name category");

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    res.status(200).json({
      success: true,
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};