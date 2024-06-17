import { merchQueue } from "../services/merchService";
import { merchDriveUpload } from "../middlewares/driveUploadMiddleware"
import express from "express";
import multer from "multer";

const upload = multer();
const router = express.Router();

router.post("/", upload.any(), merchDriveUpload, merchQueue);

module.exports = router;
