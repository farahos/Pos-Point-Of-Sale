import Buyer from "../model/buyer.js";

// Create a new buyer
export const createBuyer = async (req, res) => {
  try {
    const { name, email, phone, requestedProduct, buyer } = req.body;
    
    const newBuyer = new Buyer({
      name,
      email,
      phone,
      requestedProduct,
      buyer
    });

    const savedBuyer = await newBuyer.save();
    
    // Populate the buyer reference
    await savedBuyer.populate('buyer');
    
    res.status(201).json({
      success: true,
      message: "Buyer created successfully",
      data: savedBuyer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating buyer",
      error: error.message
    });
  }
};

// Get all buyers
export const getAllBuyers = async (req, res) => {
  try {
    const buyers = await Buyer.find().populate('buyer').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: buyers.length,
      data: buyers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching buyers",
      error: error.message
    });
  }
};

// Get buyer by ID
export const getBuyerById = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.params.id).populate('buyer');
    
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: buyer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching buyer",
      error: error.message
    });
  }
};

// Update buyer
export const updateBuyer = async (req, res) => {
  try {
    const { name, email, phone, requestedProduct, buyer } = req.body;
    
    const updatedBuyer = await Buyer.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        requestedProduct,
        buyer
      },
      { new: true, runValidators: true }
    ).populate('buyer');
    
    if (!updatedBuyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Buyer updated successfully",
      data: updatedBuyer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating buyer",
      error: error.message
    });
  }
};

// Delete buyer
export const deleteBuyer = async (req, res) => {
  try {
    const deletedBuyer = await Buyer.findByIdAndDelete(req.params.id);
    
    if (!deletedBuyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Buyer deleted successfully",
      data: deletedBuyer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting buyer",
      error: error.message
    });
  }
};

// Get buyers by seller ID
export const getBuyersBySeller = async (req, res) => {
  try {
    const buyers = await Buyer.find({ buyer: req.params.sellerId })
      .populate('buyer')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: buyers.length,
      data: buyers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching buyers by seller",
      error: error.message
    });
  }
};