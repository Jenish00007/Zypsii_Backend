// app.js
require("dotenv").config();
const { app, server } = require('./socket/socket');
const cors = require("cors");
const express = require('express');
const mongoose = require("mongoose");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");

// Routes
const userRoutes = require('./components/users/routers');
const scheduleRoutes = require('./components/schedules/routers');
const followsRoutes = require('./components/follows/routes');
const mediaFileUpload = require('./components/commonAPIs/routes/fileUploadRoutes');
const post = require('./components/posts/routes/');
const shorts = require('./components/shorts/routes');
const story = require('./components/story/routes');
const places = require('./components/wheretogo/routes');
const messageRoutes = require('./components/messages/routes/message.routes');
const splitRoutes = require('./components/splits/routes/split.routes');

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection error:", err));

// Security Middleware
app.disable("x-powered-by");
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS Configuration
const corsOptions = {
  origin: process.env.ORIGINS,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// Routes
app.use(userRoutes);
app.use(scheduleRoutes);
app.use(followsRoutes);
app.use(mediaFileUpload);
app.use(post);
app.use(shorts);
app.use(story);
app.use(places);
app.use(messageRoutes);
app.use(splitRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start HTTP server (with Socket.IO attached)
server.listen(process.env.SERVER_PORT, () => {
  console.log(`Server listening: http://localhost:${process.env.SERVER_PORT}`);
});

module.exports = app;
