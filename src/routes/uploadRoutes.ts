import { fileUpload } from "../services/uploadService";
import express from "express";
import multer from "multer";

const upload = multer();
const router = express.Router();

router.post("/payment", upload.any(), (req, res) => fileUpload(req, res, "payment"));
router.post("/follow", upload.any(), (req, res) => fileUpload(req, res, "follow"));

module.exports = router;
