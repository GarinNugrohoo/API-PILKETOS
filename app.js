require("dotenv").config();
const express = require("express");
const router = require("./routes");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");
const path = require("path");
const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use(router);
app.use("/uploads", express.static(path.join(__dirname, "assets/images")));
app.use("/uploads", express.static(path.join(__dirname, "assets/pdf")));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

module.exports = app;

if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
}
