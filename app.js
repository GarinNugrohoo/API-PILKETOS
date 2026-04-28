require("dotenv").config();
const express = require("express");
const router = require("./routes");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");
const path = require("path");
const app = express();
const port = process.env.PORT;
const GIT_URL = "https://cdnjs.cloudflare.com";

app.use(express.json());

app.use(router);
app.use("/uploads", express.static(path.join(__dirname, "assets/images")));
app.use("/uploads", express.static(path.join(__dirname, "assets/pdf")));

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server Express berhasil berjalan di Vercel",
    documentation: "/api-docs",
    version: "1.0.0",
  });
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerFile, {
    customCssUrl: `${GIT_URL}swagger-ui.min.css`,
    customJs: [
      `${GIT_URL}swagger-ui-bundle.js`,
      `${GIT_URL}swagger-ui-standalone-preset.js`,
    ],
  }),
);

module.exports = app;

if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
}
