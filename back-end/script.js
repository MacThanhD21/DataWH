// routes/cube.js
const express = require("express");
const router = express.Router();
const connection = require("../ssas/connection");

router.get("/", async (req, res) => {
  try {
    // 3d_ThoiGian_MatHang_KhachHang
    const mdx = `
        SELECT
        {[Measures].[Quantity], [Measures].[Total Revenue]} ON COLUMNS,
        NON EMPTY
        (
          [Dim Time].[Year].Members *
          [Dim Time].[Quater].Members *
          [Dim Time].[Month].Members *
          [Dim Item].[Item Id].Members *
          [Dim Customer].[Customer Id].Members * 
          [Dim Customer].[City Id].Members *
          [Dim Customer].[State].Members
        ) ON ROWS
        FROM [3D_Time_Customer_Item]
    `;

    // 1d_ThoiGian
    // const mdx = `
    //     SELECT
    //     {[Measures].[So Luong], [Measures].[Tong Doanh Thu]} ON COLUMNS,
    //     [DIM Thoi Gian].[Nam].Members * [DIM Thoi Gian].[Quy].Members * [DIM Thoi Gian].[Thang].Members ON ROWS
    //     FROM [1d_ThoiGian]
    // `;

    // 1d_MatHang
    // const mdx = `
    //     SELECT
    //     {[Measures].[So Luong], [Measures].[Tong Doanh Thu]} ON COLUMNS,
    //     [DIM Mat Hang].[Ma Mat Hang].Members ON ROWS
    //     FROM [1d_MatHang]
    // `;

    // 1d_KhachHang
    // const mdx = `
    //     SELECT
    //     {[Measures].[So Luong], [Measures].[Tong Doanh Thu]} ON COLUMNS,
    //     [DIM Khach Hang].[Ma Khach Hang].Members * [DIM Khach Hang].[Ma Thanh Pho].Members * [DIM Khach Hang].[Bang].Members ON ROWS
    //     FROM [1d_KhachHang]
    // `;

    // 2d_ThoiGian_MatHang
    // const mdx = `
    //   SELECT
    //   {[Measures].[So Luong], [Measures].[Tong Doanh Thu]} ON COLUMNS,
    //   NON EMPTY
    //   ([DIM Thoi Gian].[Nam].Members *
    //   [DIM Thoi Gian].[Quy].Members *
    //   [DIM Thoi Gian].[Thang].Members *
    //   [DIM Mat Hang].[Ma Mat Hang].Members) ON ROWS
    //   FROM [2d_ThoiGian_MatHang]
    // `;

    // 2d_ThoiGian_KhachHang
    // const mdx = `
    //   SELECT
    //   {[Measures].[So Luong], [Measures].[Tong Doanh Thu]} ON COLUMNS,
    //   NON EMPTY
    //   ([DIM Thoi Gian].[Nam].Members *
    //   [DIM Thoi Gian].[Quy].Members *
    //   [DIM Thoi Gian].[Thang].Members *
    //   [DIM Khach Hang].[Ma Khach Hang].Members *
    //   [DIM Khach Hang].[Ma Thanh Pho].Members *
    //   [DIM Khach Hang].[Bang].Members) ON ROWS
    //   FROM [2d_ThoiGian_KhachHang]
    // `;

    // 2d_MatHang_KhachHang
    // const mdx = `
    //   SELECT
    //   {[Measures].[So Luong], [Measures].[Tong Doanh Thu]} ON COLUMNS,
    //   NON EMPTY
    //   ([DIM Mat Hang].[Ma Mat Hang].Members *
    //   [DIM Khach Hang].[Ma Khach Hang].Members *
    //   [DIM Khach Hang].[Ma Thanh Pho].Members *
    //   [DIM Khach Hang].[Bang].Members) ON ROWS
    //   FROM [2d_MatHang_KhachHang]
    // `;

    console.log("Generated MDX Query:\n", mdx);

    const data = await connection.query(mdx);
    res.json(data);
  } catch (err) {
    console.error("MDX query error:", err);
    res.status(500).json({ error: "Failed to query SSAS" });
  }
});

module.exports = router;
