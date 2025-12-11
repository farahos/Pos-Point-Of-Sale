import seller from "../model/seller.js";

// Create new seller
export const createseller = async (req, res) => {
  try {
    const { fullname, rate, samiga, value } = req.body;
    
    const newseller = new seller({
      fullname,
      rate,
      samiga,
      value,
      uploadedBy: req.user?.id // assuming you have auth middleware
    });

    const savedseller = await newseller.save();
    
    res.status(201).json({
      success: true,
      message: "seller successfully created",
      data: savedseller
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating seller",
      error: error.message
    });
  }
};

// Get all sellers
export const getAllsellers = async (req, res) => {
  try {
    const { status, page = 1, limit = 100 } = req.query;
    
    let filter = {};
    if (status) filter.status = status;

    const sellers = await seller.find(filter)
      .populate("uploadedBy", "username email") // adjust fields as needed
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await seller.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: sellers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalsellers: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching sellers",
      error: error.message
    });
  }
};

// single seller
export const getsellerById = async (req, res) => {
  try {
    const { id } = req.params;
    const foundseller = await seller.findById(id)
      .populate("uploadedBy", "username email");
    if (!foundseller) {
      return res.status(404).json({
        success: false,
        message: "seller not found"
      });
    }
    res.status(200).json({  
      success: true,
      data: foundseller
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching seller",
      error: error.message
    });
  }
};

// Update seller
export const updateseller = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedseller = await seller.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("uploadedBy", "username email");

    if (!updatedseller) {
      return res.status(404).json({
        success: false,
        message: "seller not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "seller updated successfully",
      data: updatedseller
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating seller",
      error: error.message
    });
  }
};

// Update seller status
export const updatesellerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Available","Pending","Sold"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    const updatedseller = await seller.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate("uploadedBy", "username email");

    if (!updatedseller) {
      return res.status(404).json({
        success: false,
        message: "seller not found"
      });
    }

    res.status(200).json({
      success: true,
      message: `seller status updated to ${status}`,
      data: updatedseller
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating seller status",
      error: error.message
    });
  }
};

// Delete seller
export const deleteseller = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedseller = await seller.findByIdAndDelete(id);

    if (!deletedseller) {
      return res.status(404).json({
        success: false,
        message: "seller not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "seller deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting seller",
      error: error.message
    });
  }
};