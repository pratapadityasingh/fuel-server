import express from "express";
import {
  createOnlinePayment,
  getAllOnlinePayments,
} from "../controllers/onlinePaymentController";
import { auth, allowRoles } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/create", auth, allowRoles("admin"), createOnlinePayment);
router.get("/getall", auth, allowRoles("admin"), getAllOnlinePayments);



export default router;