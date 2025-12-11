import express from "express";
import {
  createSale,
  getSales,
  getSaleById,
  updateSaleStatus,
  deleteSale,
  getSalesStats,
  getInvoice
} from "../controller/SalesController.js"

// Import middleware if needed
// import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Sales routes
router.post("/", createSale);
router.get("/", getSales);
router.get("/stats", getSalesStats);
router.get("/invoice/:invoiceNumber", getInvoice);
router.get("/:id", getSaleById);
router.patch("/:id/status", updateSaleStatus);
router.delete("/:id", deleteSale);

// With authentication (uncomment when ready)
// router.post("/", protect, createSale);
// router.get("/", protect, getSales);
// router.get("/stats", protect, getSalesStats);
// router.get("/:id", protect, getSaleById);
// router.patch("/:id/status", protect, admin, updateSaleStatus);
// router.delete("/:id", protect, admin, deleteSale);

export default router;