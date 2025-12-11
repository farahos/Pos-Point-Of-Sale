import express from "express";
import {
  createseller,
  getAllsellers,
  getsellerById,
  updateseller,
  updatesellerStatus,
  deleteseller
} from "../controller/sellerController.js";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";
const router = express.Router();

// Apply auth middleware to all routes

// seller routes
router.post("/",authenticate, authorizeRoles("admin"), createseller);
router.get("/", authenticate,getAllsellers);
router.get("/:id", authenticate,  getsellerById);
router.put("/:id",authenticate,  updateseller);
router.patch("/:id/status", authenticate, updatesellerStatus);
router.delete("/:id",authenticate, authorizeRoles("admin"), deleteseller);

export default router;