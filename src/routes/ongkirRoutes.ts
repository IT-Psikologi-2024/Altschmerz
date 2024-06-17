import { getProvince, getCity, getOngkir } from "../services/ongkirService";
import express from "express";

const router = express.Router();

router.get("/get-province", getProvince);
router.get("/get-city/:id", getCity);

router.get("/get-ongkir/:id", getOngkir);

module.exports = router;
