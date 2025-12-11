import express from "express";
import {
  createBuyer,
  getAllBuyers,
  getBuyerById,
  updateBuyer,
  deleteBuyer,
  getBuyersBySeller
} from "../controller/buyercontroller.js"
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";

const router = express.Router();

// Create a new buyer
router.post("/",authenticate,  createBuyer);

// Get all buyers
router.get("/", authenticate, authorizeRoles("admin"),getAllBuyers);

// Get buyer by ID
router.get("/:id",authenticate, authorizeRoles("admin"), getBuyerById);

// Update buyer
router.put("/:id",authenticate, authorizeRoles("admin"), updateBuyer);

// Delete buyer
router.delete("/:id", authenticate, authorizeRoles("admin"),deleteBuyer);

// Get buyers by seller ID
router.get("/seller/:sellerId", authenticate, authorizeRoles("admin"),getBuyersBySeller);

export default router;