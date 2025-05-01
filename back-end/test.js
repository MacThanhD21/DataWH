const cubeRegistry = [
  {
    dims: ["Dim Time"],
    cube: "1D_Time",
  },
  {
    dims: ["Dim Item"],
    cube: "1D_Item",
  },
  {
    dims: ["Dim Customer"],
    cube: "1D_Customer",
  },
  {
    dims: ["Dim Time", "Dim Item"],
    cube: "2D_Time_Item",
  },
  {
    dims: ["Dim Time", "Dim Customer"],
    cube: "2D_Time_Customer",
  },
  {
    dims: ["Dim Item", "Dim Customer"],
    cube: "2D_Item_Customer",
  },
  {
    dims: ["Dim Time", "Dim Item", "Dim Customer"],
    cube: "3D_Time_Customer_Item",
  },
];

function generateMDX(dimElements) {
  // Bước 1: Trích tên DIM từ các phần tử (VD: "[Dim Time].[Nam]" -> "Dim Time")
  const dimNames = [
    ...new Set(dimElements.map((el) => el.match(/\[([^\]]+)\]/)[1])),
  ].sort();

  // Bước 2: Tìm dataset phù hợp từ registry
  const matchedCube = cubeRegistry.find((entry) => {
    const sortedDims = [...entry.dims].sort();
    return JSON.stringify(sortedDims) === JSON.stringify(dimNames);
  });

  if (!matchedCube) {
    throw new Error(
      `Không tìm thấy dataset phù hợp với các DIM: ${dimNames.join(", ")}`
    );
  }

  // Bước 3: Dựng MDX
  const rowsPart = dimElements.join(" * ");
  const mdx = `
      SELECT
      {[Measures].[Quantity], [Measures].[Total Revenue]} ON COLUMNS,
      NON EMPTY (${rowsPart}) ON ROWS
      FROM [${matchedCube.cube}]
    `;

  return mdx;
}

// Truy vấn chỉ theo thời gian
console.log(generateMDX(["[Dim Time].[Year]"]));

// Truy vấn theo thời gian và mặt hàng
console.log(
  generateMDX(["[Dim Time].[Year]", "[Dim Item].[Item Id]"])
);

// Truy vấn theo thời gian, mặt hàng và khách hàng
console.log(
  generateMDX([
    "[Dim Time].[Year]",
    "[Dim Time].[Month]",
    "[Dim Item].[Item Id]",
    "[Dim Customer].[Customer Id]",
  ])
);
