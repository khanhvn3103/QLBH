const express = require("express");
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../Controllers/userController"); // Import các hàm từ userController

// Route: Lấy danh sách tất cả users
router.get("/", getUsers);

// Route: Tạo mới user
router.post("/", createUser);

// Route: Cập nhật user theo ID
router.put("/:id", updateUser);

// Route: Xóa user theo ID
router.delete("/:id", deleteUser);

module.exports = router;
