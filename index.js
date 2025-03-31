const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./Routes/user"); // Import routes của User

const app = express();

// Middleware xử lý JSON
app.use(express.json());

// Kết nối với MongoDB
async function connectDB() {
  try {
    await mongoose.connect("mongodb://localhost:27017/QLBH", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Đã kết nối thành công với MongoDB!");
  } catch (error) {
    console.error("Lỗi khi kết nối tới MongoDB:", error);
    process.exit(1); // Kết thúc chương trình nếu kết nối thất bại
  }
}
connectDB();

// Định nghĩa routes
app.use("/users", userRoutes); // Đường dẫn cho các routes của User

// Route mặc định
app.get("/", (req, res) => {
  res.send("Chào mừng bạn đến với ứng dụng quản lý người dùng!");
});

// Khởi chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
});
