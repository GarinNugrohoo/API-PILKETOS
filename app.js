require("dotenv").config();
const express = require("express");
const router = require("./routes");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");
const path = require("path");
const app = express();
const port = 3000;

app.use(express.json());

app.use(router);
app.use("/uploads", express.static(path.join(__dirname, "assets/images")));
app.use("/uploads", express.static(path.join(__dirname, "assets/pdf")));

app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
