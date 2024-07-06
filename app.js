const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const http = require("http");
const expressRateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const ExpressMongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const helmet = require("helmet");
const xssClean = require("xss-clean");
const routes = require("./routes/index.routes");
const AppError = require("./errors/AppError");
const errorController = require("./controllers/error.controller");

// * Local ENV Variables
dotenv.config({ path: "./config.env" });

// * Express.js
const app = express();

// * CORS Configuration
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// * Server
const server = http.createServer(app);

server.listen(process.env.PORT, () =>
  console.log(`The server started listening on PORT: ${process.env.PORT}`)
);

// * API Limit
const limit = expressRateLimit({
  max: 100,
  windowsMs: 60 * 60 * 1000,
  message: "Too many requests!",
  standartHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit }));

// * MongoDB Connection
(async function () {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("The connection to the MongoDB is successful.");
  } catch (e) {
    console.error(`The connection to the MongoDB is failed.`);
  }
})();

// * Security
app.use(ExpressMongoSanitize());
app.use(hpp());
app.use(helmet());
app.use(xssClean());

// * Routes
app.use("/api", routes);

// * Unsupported Routes
app.all("*", (req, res, next) =>
  next(new AppError(404, "fail", `Unsupported API URL: ${req.originalUrl}`))
);

// * Uncaught Exception
process.on("uncaughtException", (err) => {
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});

// * Unhandled Rejection
process.on("unhandledRejection", (err) => {
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});

// * Error Handling
app.use(errorController);

module.exports = app;
