const express = require("express");
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");
const dotenv = require("dotenv");
const session = require("express-session");
const userRoutes = require("./Routes/router");

dotenv.config();

const app = express();

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "layouts/main");

// Middleware kiểm tra đăng nhập
app.use((req, res, next) => {
  if (!req.session.user && req.path !== "/login" && req.path !== "/logout") {
    return res.redirect("/login");
  }
  next();
});

// Routes
app.use("/", userRoutes);

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
