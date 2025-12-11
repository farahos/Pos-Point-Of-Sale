import Product from "../model/Products.js"

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (category) {
      query.category = category;
    }
    
    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      pricePerUnit,
      pricePerKg,
      pricePerCase,
      unitsPerCase,
      kgPerCase,
      stockUnits = 0,
      stockKg = 0
    } = req.body;

    // Validate required fields
    if (!name || !pricePerUnit || !pricePerKg || !pricePerCase || !unitsPerCase || !kgPerCase) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    // Check if product already exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product with this name already exists"
      });
    }

    // Create product
    const product = await Product.create({
      name,
      category,
      pricePerUnit,
      pricePerKg,
      pricePerCase,
      unitsPerCase,
      kgPerCase,
      stockUnits,
      stockKg
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      pricePerUnit,
      pricePerKg,
      pricePerCase,
      unitsPerCase,
      kgPerCase,
      stockUnits,
      stockKg
    } = req.body;

    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Check if name is being changed and if it already exists
    if (name && name !== product.name) {
      const existingProduct = await Product.findOne({ name });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: "Product with this name already exists"
        });
      }
    }

    // Update product
    product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        category,
        pricePerUnit,
        pricePerKg,
        pricePerCase,
        unitsPerCase,
        kgPerCase,
        stockUnits,
        stockKg
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Update stock
// @route   PATCH /api/products/:id/stock
// @access  Private
export const updateStock = async (req, res) => {
  try {
    const { stockUnits, stockKg, operation = "set" } = req.body;

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    let newStockUnits = product.stockUnits;
    let newStockKg = product.stockKg;

    // Handle different stock update operations
    if (stockUnits !== undefined) {
      if (operation === "increment") {
        newStockUnits += stockUnits;
      } else if (operation === "decrement") {
        newStockUnits -= stockUnits;
        if (newStockUnits < 0) newStockUnits = 0;
      } else {
        newStockUnits = stockUnits;
      }
    }

    if (stockKg !== undefined) {
      if (operation === "increment") {
        newStockKg += stockKg;
      } else if (operation === "decrement") {
        newStockKg -= stockKg;
        if (newStockKg < 0) newStockKg = 0;
      } else {
        newStockKg = stockKg;
      }
    }

    // Update product stock
    product.stockUnits = newStockUnits;
    product.stockKg = newStockKg;
    
    await product.save();

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: product
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
export const getProductCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories.filter(cat => cat !== null && cat !== "")
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Please provide a search query"
      });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } }
      ]
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private
export const getLowStockProducts = async (req, res) => {
  try {
    const { thresholdUnits = 10, thresholdKg = 10 } = req.query;
    
    const lowStockProducts = await Product.find({
      $or: [
        { stockUnits: { $lte: parseInt(thresholdUnits) } },
        { stockKg: { $lte: parseInt(thresholdKg) } }
      ]
    });

    res.status(200).json({
      success: true,
      count: lowStockProducts.length,
      data: lowStockProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Bulk update products
// @route   PUT /api/products/bulk/update
// @access  Private
export const bulkUpdateProducts = async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of products to update"
      });
    }

    const updateOperations = products.map(product => ({
      updateOne: {
        filter: { _id: product.id },
        update: { $set: product.data }
      }
    }));

    const result = await Product.bulkWrite(updateOperations);

    res.status(200).json({
      success: true,
      message: "Bulk update completed",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};