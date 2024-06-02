const dotenv = require("dotenv").config();
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
    console.log(err);
    process.exit(1);
});

const app = require("./app");

// const DB = process.env.DATABASE.replace(
//     "<PASSWORD>",
//     process.env.DATABASE_PASSWORD
// );

// mongoose.connect(DB).then(() => {
//     console.log("Connection to DB was successful");
// });

const db = mongoose.connect(process.env.DB_LOCAL).then(() => {
    console.log("Connection to local DB was successful");
});

const server = app.listen(process.env.PORT, () => {
    console.log("Server is running.");
});

process.on("unhandledRejection", (err) => {
    console.log("Unhandled Rejection!, shuting down...");
    console.error(err);
    server.close(() => {
        process.exit(1);
    });
});
process.on("SIGTERM", () => {
    console.log("SIGTERM received!, shuting down...");
    console.error(err);
    server.close(() => {
        console.log("process terminated");
    });
});
