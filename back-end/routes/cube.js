// routes/cube.js
const express = require("express");
const router = express.Router();
const connection = require("../ssas/connection");

const {
  generateMDX,
  buildDimElements,
  splitDataByNullValues,
} = require("../utils/functions");

router.post("/", async (req, res) => {
  try {
    const { Dim_Time, Dim_Item, Dim_Customer } = req.body;

    console.log("Request body:", req.body);
    const dimElements = buildDimElements({
      Dim_Time,
      Dim_Item,
      Dim_Customer,
    });
    console.log("Dim Elements:", dimElements);
    const mdx = generateMDX(dimElements);

    console.log("Generated MDX Query:\n", mdx);

    const rawData = await connection.query(mdx);

    const { validData, invalidData } = splitDataByNullValues(rawData);

    res.json({
      validData,
      invalidData,
    });
  } catch (err) {
    console.error("MDX query error:", err);
    res.status(500).json({ error: "Failed to query SSAS" });
  }
});

module.exports = router;
