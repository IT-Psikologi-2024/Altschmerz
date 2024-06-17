import { ticketQueue } from "../services/ticketService";
import { ticketDriveUpload } from "../middlewares/driveUploadMiddleware"
import express from "express";
import multer from "multer";

const upload = multer();
const router = express.Router();

router.post("/", upload.any(), ticketDriveUpload, ticketQueue);

module.exports = router;
