require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./models");
const models = require("./models");
const redis = require("./utility/redis");

const startServer = async function () {
  try {
    await sequelize.authenticate();
    await redis.connect();
    console.log("... Microservice db ✔");
    app.listen(process.env.SERVER_PORT);
    console.log(`--- Server started on ${process.env.SERVER_PORT} ---\n\n`);
  } catch (err) {
    console.log("server setup failed", err);
    console.log("Error: ", err.message);
  }
};

startServer();
