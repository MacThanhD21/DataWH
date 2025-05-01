const ADODB = require("node-adodb");

// Đổi provider phù hợp:
const connection = ADODB.open(
  "Provider=MSOLAP;Data Source=DESKTOP-IBS55CP\\DW;Initial Catalog=DW_Nhom18"
);

module.exports = connection;