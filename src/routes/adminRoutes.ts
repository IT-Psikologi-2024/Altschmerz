import { verifyToken } from "../middlewares/verifyToken";
import { login, attend, ticketEmail, getVerifiedAttendee} from "../services/adminService";
import express from "express";

const router = express.Router();

router.post("/login", login);
router.get("/attendance/:id", verifyToken, attend);

router.get("/verified-attendee", verifyToken, getVerifiedAttendee);
router.get("/ticket-email", verifyToken, ticketEmail);

module.exports = router;
