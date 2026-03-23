import { Response } from "express";
import OnlinePayment from "../models/onlinePaymentModel";

const getAdminFilter = (req: any) => {
  return req.user.role === "admin"
    ? { adminId: req.user._id }
    : { createdBy: req.user._id, adminId: req.user.adminId };
};


export const createOnlinePayment = async (req: any, res: Response) => {
  try {
    const { totalSale, onlinePayment, notes = "" } = req.body;

  
    if (typeof totalSale !== "number" || totalSale < 0) {
      return res.status(400).json({ message: "Total sale must be a number >= 0" });
    }

    if (typeof onlinePayment !== "number" || onlinePayment < 0) {
      return res.status(400).json({ message: "Online payment must be a number >= 0" });
    }

    if (onlinePayment > totalSale) {
      return res.status(400).json({
        message: "Online payment cannot be more than total sale",
      });
    }

    const adminId = req.user.role === "admin" ? req.user._id : req.user.adminId;

    const entry = new OnlinePayment({
      totalSale,
      onlinePayment,
      notes: notes.trim(),
      createdBy: req.user._id,
      adminId,
    });

    await entry.save();

    res.status(201).json({
      message: "Online payment entry created successfully",
      entry,
    });
  } catch (error: any) {
    console.error("Create online payment error:", error);
    res.status(500).json({ message: "Server error while creating entry" });
  }
};


export const getAllOnlinePayments = async (req: any, res: Response) => {
  try {
    const filter = getAdminFilter(req);

    const entries = await OnlinePayment.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json(entries);
  } catch (error) {
    console.error("Get online payments error:", error);
    res.status(500).json({ message: "Error fetching online entries" });
  }
};

