const { User } = require("../Models/models");

// Tìm tất cả users
async function getUsers(req, res) {
  try {
    const users = await User.find(); // Tìm tất cả users
    return res.status(200).json(users);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách users:", error);
    return res.status(500).json({ error: "Không thể lấy danh sách users" });
  }
}

// Tạo mới user (insert)
async function createUser(req, res) {
  try {
    const { _id, name, email, password } = req.body;

    const newUser = new User({
      _id,
      name,
      email,
      password,
      createdAt: new Date(),
    });

    const savedUser = await newUser.save(); // Chèn user vào database
    return res
      .status(201)
      .json({ message: "User đã được tạo thành công", user: savedUser });
  } catch (error) {
    console.error("Lỗi khi tạo user:", error);
    return res.status(500).json({ error: "Không thể tạo user" });
  }
}

// Cập nhật user (update)
async function updateUser(req, res) {
  try {
    const userId = req.params.id;
    const updatedData = req.body;

    const updatedUser = await User.updateOne(
      { _id: userId },
      { $set: updatedData }
    ); // Cập nhật user theo _id

    if (updatedUser.matchedCount === 0) {
      return res.status(404).json({ error: "User không tồn tại" });
    }
    return res
      .status(200)
      .json({ message: "User đã được cập nhật thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật user:", error);
    return res.status(500).json({ error: "Không thể cập nhật user" });
  }
}

// Xóa user (delete)
async function deleteUser(req, res) {
  try {
    const userId = req.params.id;

    const deletedUser = await User.deleteOne({ _id: userId }); // Xóa user theo _id

    if (deletedUser.deletedCount === 0) {
      return res.status(404).json({ error: "User không tồn tại" });
    }
    return res.status(200).json({ message: "User đã được xóa thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa user:", error);
    return res.status(500).json({ error: "Không thể xóa user" });
  }
}

async function findByName(req, res) {
  try {
    const name = req.params.name; // Lấy tên từ req.params

    // Sử dụng Regular Expression để tìm kiếm tên chứa từ khóa
    const users = await User.find({ name: { $regex: name, $options: "i" } });

    if (users.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy user" });
    }

    return res.status(200).json(users);
  } catch (error) {
    console.error("Lỗi khi tìm user:", error);
    return res.status(500).json({ error: "Không thể tìm user" });
  }
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  findByName,
};
