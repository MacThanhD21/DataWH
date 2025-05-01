const express = require("express");
const cors = require("cors");
const app = express();
const port = 8000;

app.use(cors()); // Cho phép mọi domain truy cập
app.use(express.json());

// Route
const cubeRoute = require("./routes/cube");
app.use("/api/cube", cubeRoute);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
