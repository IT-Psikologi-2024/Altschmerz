import { verifyToken } from "../middlewares/verifyTokenMiddleware";
import { ticketEmail, merchEmail, getVerifiedAttendee, getVerifiedBuyer} from "../services/emailService";
import express from "express";

const router = express.Router();

router.get("/verified-attendee", verifyToken, getVerifiedAttendee);
router.get("/verified-buyer", verifyToken, getVerifiedBuyer);

router.get("/ticket", verifyToken, ticketEmail);
router.get("/merch", verifyToken, merchEmail);

module.exports = router;
