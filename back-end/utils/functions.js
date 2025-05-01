const { cubeRegistry } = require("./const");

function buildDimElements(params) {
  const dimLevelMap = {
    Dim_Time: {
      Month: [
        "[Dim Time].[Year]",
        "[Dim Time].[Quarter]",
        "[Dim Time].[Month]",
      ],
      Quarter: ["[Dim Time].[Year]", "[Dim Time].[Quarter]"],
      Year: ["[Dim Time].[Year]"],
    },
    Dim_Item: {
      Item_Id: ["[Dim Item].[Item Id]"],
    },
    Dim_Customer: {
      Customer_Id: [
        "[Dim Customer].[State]",
        "[Dim Customer].[City Id]",
        "[Dim Customer].[Customer Id]",
      ],
      City_Id: [
        "[Dim Customer].[State]",
        "[Dim Customer].[City Id]",
      ],
      State: ["[Dim Customer].[State]"],
    },
  };

  const elements = [];

  if (params.Dim_Time && params.Dim_Time !== "None") {
    elements.push(...dimLevelMap.Dim_Time[params.Dim_Time]);
  }

  if (params.Dim_Item && params.Dim_Item !== "None") {
    elements.push(...dimLevelMap.Dim_Item[params.Dim_Item]);
  }

  if (params.Dim_Customer && params.Dim_Customer !== "None") {
    elements.push(...dimLevelMap.Dim_Customer[params.Dim_Customer]);
  }

  return elements;
}

function generateMDX(dimElements) {
  // Bước 1: Trích tên DIM từ các phần tử (VD: "[DIM Time].[Year]" -> "DIM Time")
  const dimNames = [
    ...new Set(dimElements.map((el) => el.match(/\[([^\]]+)\]/)[1])), // Lấy ra "DIM Time"
  ].sort();

  // Bước 2: Tìm dataset phù hợp từ registry
  const matchedCube = cubeRegistry.find((entry) => {
    const sortedDims = [...entry.dims].sort();
    return JSON.stringify(sortedDims) === JSON.stringify(dimNames);
  });
  console.log(matchedCube);

  if (!matchedCube) {
    throw new Error(
      `Không tìm thấy dataset phù hợp với các DIM: ${dimNames.join(", ")}`
    );
  }

  // Bước 3: Thêm ".Members" nếu chưa có
  const dimMembers = dimElements.map((el) =>
    el.trim().endsWith(".Members") ? el : `${el}.Members`
  );

  const rowsPart = dimMembers.join(" * ");

  const mdx = `
        SELECT
        {[Measures].[Quantity], [Measures].[Total Revenue]} ON COLUMNS,
        NON EMPTY (${rowsPart}) ON ROWS
        FROM [${matchedCube.cube}]
      `;

  return mdx;
}

function splitDataByNullValues(dataArray) {
  const validData = [];
  const invalidData = [];

  dataArray.forEach((data) => {
    const hasNull = Object.values(data).some((value) => value === null);
    if (!hasNull) {
      validData.push(data);
    } else {
      invalidData.push(data);
    }
  });

  return { validData, invalidData };
}

module.exports = {
  generateMDX,
  buildDimElements,
  splitDataByNullValues,
};
