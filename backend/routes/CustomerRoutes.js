import express from "express";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  addPayment,
  getCustomerPayments,
  searchCustomersForSales
} from "../controller/CustomerController.js"

const router = express.Router();

// Customer routes
router.post("/", createCustomer);
router.get("/", getCustomers);
router.get("/search/sales", searchCustomersForSales);
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);
router.post("/:id/payments", addPayment);
router.get("/:id/payments", getCustomerPayments);

export default router;