import { verifyToken } from "../middlewares/verifyToken";
import { login, attend, getVerifiedAttendee, ticketEmail, getVerifiedBuyer, merchEmail} from "../services/adminService";
import express from "express";

const router = express.Router();

router.post("/login", login);
router.get("/attendance/:id", verifyToken, attend);

router.get("/verified-attendee", verifyToken, getVerifiedAttendee);
router.get("/ticket-email", verifyToken, ticketEmail);

router.get("/verified-buyer", verifyToken, getVerifiedBuyer);
router.get("/merch-email", verifyToken, merchEmail);

module.exports = router;
