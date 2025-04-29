require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");

//import all the routes here:
const userRoutes = require('./components/users/routers');
const scheduleRoutes = require('./components/schedules/routers');
const followsRoutes = require('./components/follows/routes');
const mediaFileUpload = require('./components/commonAPIs/routes/fileUploadRoutes');
const post = require('./components/posts/routes/');
const shorts = require('./components/shorts/routes');
const story = require('./components/story/routes');

// Database Connection 
//mongoose.set('debug', true);  // Logs all MongoDB queries to console for local

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection error:", err));

const app = express();

// Security Middleware
app.disable("x-powered-by"); // Hide Express Server Info
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS Configuration
const corsOptions = {
  origin: process.env.ORIGINS, // Change to your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});

app.use(limiter);

// Use Routes
app.use(userRoutes);
app.use(scheduleRoutes);
app.use(followsRoutes);
app.use(mediaFileUpload);
app.use(post);
app.use(shorts);
app.use(story);

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(`http://localhost:${process.env.SERVER_PORT}`)
})

module.exports = app;