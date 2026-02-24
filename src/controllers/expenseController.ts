import { Response } from "express";
import Expense from "../models/expenseModel";

// Helper: only same admin can access/modify
const getAdminFilter = (req: any) => {
  return req.user.role === "admin"
    ? { adminId: req.user._id }
    : { createdBy: req.user._id, adminId: req.user.adminId };
};

/**
 * ✅ CREATE EXPENSE
 */
export const createExpense = async (req: any, res: Response) => {
  try {
    const { name, amount, status = "unpaid" } = req.body;

    if (!name?.trim() || !amount || amount < 1) {
      return res.status(400).json({ message: "Name and valid amount (>=1) are required" });
    }

    if (!["paid", "unpaid"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'paid' or 'unpaid'" });
    }

    const adminId = req.user.role === "admin" ? req.user._id : req.user.adminId;

    const expense = new Expense({
      name: name.trim(),
      amount,
      status,
      createdBy: req.user._id,
      adminId,
    });

    await expense.save();

    res.status(201).json({
      message: "Expense created successfully",
      expense,
    });
  } catch (error: any) {
    console.error("Create expense error:", error);
    res.status(500).json({ message: "Server error while creating expense" });
  }
};

/**
 * ✅ GET ALL EXPENSES (for current admin)
 */
export const getAllExpenses = async (req: any, res: Response) => {
  try {
    const filter = getAdminFilter(req);

    const expenses = await Expense.find(filter)
      .sort({ createdAt: -1 })
      .lean(); // faster response

    res.json(expenses);
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({ message: "Error fetching expenses" });
  }
};

/**
 * ✅ GET SINGLE EXPENSE BY ID
 */
export const getExpenseById = async (req: any, res: Response) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const filter = getAdminFilter(req);
    if (
      expense.adminId.toString() !== filter.adminId?.toString() &&
      expense.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expense" });
  }
};

/**
 * 🔁 UPDATE EXPENSE
 * → No special rollback logic needed (unlike sales/stock)
 */
export const updateExpense = async (req: any, res: Response) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const filter = getAdminFilter(req);
    if (
      expense.adminId.toString() !== filter.adminId?.toString() &&
      expense.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, amount, status } = req.body;

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ message: "Name cannot be empty" });
      expense.name = name.trim();
    }

    if (amount !== undefined) {
      if (amount < 1) return res.status(400).json({ message: "Amount must be >= 1" });
      expense.amount = amount;
    }

    if (status !== undefined) {
      if (!["paid", "unpaid"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      expense.status = status;
    }

    await expense.save();

    res.json({
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    console.error("Update expense error:", error);
    res.status(500).json({ message: "Update failed" });
  }
};

/**
 * ❌ DELETE EXPENSE
 */
export const deleteExpense = async (req: any, res: Response) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const filter = getAdminFilter(req);
    if (
      expense.adminId.toString() !== filter.adminId?.toString() &&
      expense.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Optional: you can add same-day restriction like in sales
    // if (!isSameDay(new Date(), expense.createdAt)) {
    //   return res.status(400).json({ message: "Can only delete today's expenses" });
    // }

    await expense.deleteOne();

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({ message: "Delete failed" });
  }
};