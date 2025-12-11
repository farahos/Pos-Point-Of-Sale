import Customer from "../model/Customers.js"
import Sale from "../model/Sales.js";

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
export const createCustomer = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerAddress,
      guaranteeName,
      guaranteePhone,
      creditLimit,
      email,
      notes
    } = req.body;

    // Validate required fields
    if (!customerName || !customerPhone || !customerAddress) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, and address are required"
      });
    }

    // Check if phone already exists
    const existingCustomer = await Customer.findOne({ customerPhone });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Customer with this phone number already exists"
      });
    }

    // Create customer
    const customer = await Customer.create({
      customerName,
      customerPhone,
      customerAddress,
      guaranteeName,
      guaranteePhone,
      creditLimit: creditLimit || 0,
      email,
      notes
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
export const getCustomers = async (req, res) => {
  try {
    const {
      search,
      status,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    const query = {};

    // Search by name or phone
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const customers = await Customer.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-salesHistory -paymentHistory");

    const total = await Customer.countDocuments(query);

    // Calculate summary stats
    const stats = await Customer.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalCreditLimit: { $sum: "$creditLimit" },
          totalCurrentCredit: { $sum: "$currentCredit" }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      stats: stats[0] || { totalCustomers: 0, totalCreditLimit: 0, totalCurrentCredit: 0 },
      data: customers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get single customer with details
// @route   GET /api/customers/:id
// @access  Private
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate({
        path: "salesHistory",
        select: "invoiceNumber saleDate totalPrice paymentMethod paymentStatus",
        options: { sort: { saleDate: -1 }, limit: 10 }
      });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    // Get recent sales beyond the populated ones
    const recentSales = await Sale.find({ customer: customer._id })
      .populate("product", "name")
      .sort({ saleDate: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: {
        ...customer.toObject(),
        recentSales
      }
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
export const updateCustomer = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerAddress,
      guaranteeName,
      guaranteePhone,
      creditLimit,
      status,
      email,
      notes
    } = req.body;

    // Check if phone is being changed and if it exists
    if (customerPhone) {
      const existingCustomer = await Customer.findOne({
        customerPhone,
        _id: { $ne: req.params.id }
      });
      
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: "Another customer with this phone number already exists"
        });
      }
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        customerName,
        customerPhone,
        customerAddress,
        guaranteeName,
        guaranteePhone,
        creditLimit,
        status,
        email,
        notes
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private
export const deleteCustomer = async (req, res) => {
  try {
    // Check if customer has any sales
    const salesCount = await Sale.countDocuments({ customer: req.params.id });
    
    if (salesCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete customer with existing sales history"
      });
    }

    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully"
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Add payment to customer
// @route   POST /api/customers/:id/payments
// @access  Private
export const addPayment = async (req, res) => {
  try {
    const { amount, description, paymentMethod, reference } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid payment amount is required"
      });
    }

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    // Create payment record
    const paymentData = {
      date: new Date(),
      amount,
      description: description || "Payment",
      paymentMethod: paymentMethod || "cash",
      reference
    };

    await customer.addPayment(paymentData);

    res.status(200).json({
      success: true,
      message: "Payment recorded successfully",
      data: {
        customer: await Customer.findById(req.params.id).select("-salesHistory -paymentHistory"),
        payment: paymentData
      }
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get customer payments
// @route   GET /api/customers/:id/payments
// @access  Private
export const getCustomerPayments = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .select("paymentHistory customerName");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        customerName: customer.customerName,
        payments: customer.paymentHistory.sort((a, b) => b.date - a.date)
      }
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Search customers for sales
// @route   GET /api/customers/search/sales
// @access  Private
export const searchCustomersForSales = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters"
      });
    }

    const customers = await Customer.find({
      $and: [
        { status: "active" },
        {
          $or: [
            { customerName: { $regex: query, $options: "i" } },
            { customerPhone: { $regex: query, $options: "i" } }
          ]
        }
      ]
    })
    .select("customerName customerPhone customerAddress creditLimit currentCredit")
    .limit(10);

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};