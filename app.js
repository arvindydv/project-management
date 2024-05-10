const express = require("express");
const cors = require("cors");
const routes = require("./routes");
// const ReqResLoggerMiddleware = require("./middlewares/req-res-logger");
const { commonErrorHandler } = require("./helpers/error-handler.helper");

const app = express();
app.use(express.json());

// Enable cors support to accept cross origin requests
app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));

app.use("/health", (_req, res) => {
  res.send({ message: "Application runing successfully!" });
});

// REST API entry point
routes.registerRoutes(app);

// 404 Error Handling
app.use((req, res) => {
  const message = "Invalid endpoint";
  commonErrorHandler(req, res, message, 404);
});

module.exports = app;
