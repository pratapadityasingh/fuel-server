// routes/expenseRoutes.ts
import express from "express";
import {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController";
import { auth, allowRoles } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/create", auth, allowRoles("admin"), createExpense);
router.get("/getall", auth, allowRoles("admin"), getAllExpenses);
router.get("/getexpense/:id", auth, allowRoles("admin"), getExpenseById);
router.put("/updateexpense/:id", auth, allowRoles("admin"), updateExpense);
router.delete("/deleteexpense/:id", auth, allowRoles("admin"), deleteExpense);

export default router;