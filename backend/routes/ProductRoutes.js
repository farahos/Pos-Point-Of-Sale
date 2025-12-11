import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getProductCategories,
  searchProducts,
  getLowStockProducts,
  bulkUpdateProducts
} from "../controller/ProductController.js"

// Optional: Import middleware for authentication/authorization
// import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/categories", getProductCategories);
router.get("/search", searchProducts);
router.get("/:id", getProductById);

// Protected routes (add middleware as needed)
// router.post("/", protect, admin, createProduct);
// router.put("/:id", protect, admin, updateProduct);
// router.delete("/:id", protect, admin, deleteProduct);
// router.patch("/:id/stock", protect, updateStock);
// router.get("/low-stock", protect, getLowStockProducts);
// router.put("/bulk/update", protect, admin, bulkUpdateProducts);

// Routes without authentication (for testing)
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.patch("/:id/stock", updateStock);
router.get("/low-stock", getLowStockProducts);
router.put("/bulk/update", bulkUpdateProducts);

export default router;