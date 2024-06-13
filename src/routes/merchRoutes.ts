import { merchQueue } from "../services/merchService";
import express from "express";
import multer from "multer";

const upload = multer();
const router = express.Router();

router.post("/", upload.any(), merchQueue);

module.exports = router;
