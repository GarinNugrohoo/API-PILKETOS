const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "API PILKETOS-WEB",
    description: "Dokumentasi Endpoint API PILKETOS-WEB",
  },
  host: "localhost:3000",
  schemes: ["http"],
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./app.js", "./routes/*.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);
