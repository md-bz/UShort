const express = require("express");
const path = require("path");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");
const AppError = require("./utils/AppError");
const { errorHandler } = require("./controllers/errorController");
const userRouter = require("./routes/userRoutes");
const urlRouter = require("./routes/urlRoutes");
const viewRouter = require("./routes/viewRotues");
const shortUrlRouter = require("./routes/shortUrlRoutes");
const { getUrl } = require("./controllers/urlController");

const app = express();

// app.enable("trust proxy");

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Implement CORS
// app.use(cors());
// app.options("*", cors());

// Static site
app.use(express.static(path.join(__dirname, "public")));

// Middlewares

// Set security headers
app.use(helmet({ contentSecurityPolicy: false }));

// Log for development
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Limit requests from same ip
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please retry in an hour",
});

app.use("/api", limiter);

// Body parser and body size limit
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Data sanitization against noSql db
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
    hpp({
        whitelist: [],
    })
);

app.use(compression());

// Test
app.use((req, res, next) => {
    req.responseTime = new Date().toISOString();

    next();
});

// Routers
app.use("/api/v1/users", userRouter);
app.use("/api/v1/urls", urlRouter);
app.use("/", viewRouter, getUrl);

app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

app.use(errorHandler);

// App launch
module.exports = app;
