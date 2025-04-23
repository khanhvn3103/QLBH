const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Quản lý khách hàng
getCustomers = async (req, res) => {
  const db = mongoose.connection.db;
  const customers = await db
    .collection("customers")
    .find()
    .sort({ point: 1 })
    .toArray();
  res.render("QuanLyKhachHang", { title: "Quản Lý Khách Hàng", customers });
};

// Quản lý sản phẩm
getProducts = async (req, res) => {
  const db = mongoose.connection.db;
  const products = await db
    .collection("products")
    .find({ stock: { $gt: 0 } })
    .sort({ stock: 1 })
    .toArray();
  res.render("QuanLySanPham", { title: "Quản Lý Sản Phẩm", products });
};

// Thêm sản phẩm
addProduct = async (req, res) => {
  const db = mongoose.connection.db;
  const { name, price, stock } = req.body;
  const newProduct = {
    name,
    price: parseFloat(price),
    stock: parseInt(stock),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await db.collection("products").insertOne(newProduct);
  res.status(201).json({ message: "Sản phẩm đã được thêm" });
};

// Quản lý người dùng
getUsers = async (req, res) => {
  const db = mongoose.connection.db;
  const users = await db.collection("users").find().sort({ name: 1 }).toArray();
  res.render("QuanLyTaiKhoan", { title: "Quản Lý Người Dùng", users });
};

// Thêm người dùng
addUser = async (req, res) => {
  const db = mongoose.connection.db;
  const { username, name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    username,
    name,
    email,
    password: hashedPassword,
    createdAt: new Date(),
  };
  await db.collection("users").insertOne(newUser);
  res.status(201).json({ message: "Người dùng đã được thêm" });
};

// Sửa người dùng
updateUser = async (req, res) => {
  const db = mongoose.connection.db;
  const { id } = req.params;
  const { username, name, email, password } = req.body;
  const updateData = { username, name, email };
  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }
  await db
    .collection("users")
    .updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: updateData });
  res.status(200).json({ message: "Người dùng đã được cập nhật" });
};

// Xóa người dùng
deleteUser = async (req, res) => {
  const db = mongoose.connection.db;
  await db
    .collection("users")
    .deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
  res.status(200).json({ message: "Người dùng đã được xóa" });
};

// Quản lý voucher
getVouchers = async (req, res) => {
  const db = mongoose.connection.db;
  const vouchers = await db.collection("vouchers").find().toArray();
  res.render("QuanLyVoucher", { title: "Quản Lý Voucher", vouchers });
};

// Quản lý hóa đơn
getBills = async (req, res) => {
  const db = mongoose.connection.db;
  const bills = await db.collection("bills").find().toArray();
  const users = await db.collection("users").find().toArray();
  const customers = await db.collection("customers").find().toArray();

  const billsWithDetails = bills.map((bill) => {
    const seller = users.find((user) => user.username === bill.username);
    const buyer = customers.find((customer) => customer.phone === bill.phone);
    return {
      ...bill,
      sellerName: seller ? seller.name : "Không xác định",
      buyerName: buyer ? buyer.name : "Không xác định",
    };
  });

  res.render("DanhSachHoaDon", {
    title: "Danh Sách Hóa Đơn",
    bills: billsWithDetails,
  });
};

// Trang tạo hóa đơn (Trang chủ)
getCreateBill = async (req, res) => {
  const db = mongoose.connection.db;
  const products = await db
    .collection("products")
    .find({ stock: { $gt: 0 } })
    .toArray();
  const customers = await db.collection("customers").find().toArray();
  const user = req.session.user;
  res.render("BanHang", { title: "Tạo Hóa Đơn", products, customers, user });
};

// Kiểm tra mã giảm giá
checkVoucher = async (req, res) => {
  const db = mongoose.connection.db;
  const { voucherCode } = req.body;
  const voucher = await db
    .collection("vouchers")
    .findOne({ voucher: voucherCode });
  if (voucher) {
    const now = new Date();
    if (now >= new Date(voucher.beginAt) && now <= new Date(voucher.endAt)) {
      return res.json({ valid: true, sale: voucher.sale });
    }
  }
  res.json({ valid: false });
};

// Kiểm tra khách hàng
checkCustomer = async (req, res) => {
  const db = mongoose.connection.db;
  const { phone } = req.body;
  const customer = await db.collection("customers").findOne({ phone });
  if (customer) {
    res.json({ name: customer.name, point: customer.point });
  } else {
    res.json({ name: "", point: 0 });
  }
};

// Tạo hóa đơn
createBill = async (req, res) => {
  const db = mongoose.connection.db;
  const { username, phone, customerName, voucher, items, totalPrice } =
    req.body;

  // Tìm hoặc tạo khách hàng
  let customer = await db.collection("customers").findOne({ phone });
  if (!customer) {
    customer = {
      name: customerName || "Khách vãng lai",
      phone,
      point: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection("customers").insertOne(customer);
  }

  // Tính điểm tích lũy (1 điểm cho mỗi 1,000 VND)
  let finalTotal = parseFloat(totalPrice);
  let pointsEarned = Math.floor(finalTotal / 1000);

  // Áp dụng giảm giá dựa trên điểm tích lũy
  let discount = 0;
  if (customer.point > 2000) {
    discount = 0.1; // Giảm 10%
  } else if (customer.point > 1000) {
    discount = 0.05; // Giảm 5%
  }
  finalTotal = finalTotal * (1 - discount);

  // Áp dụng mã giảm giá (nếu có)
  if (voucher) {
    const voucherData = await db.collection("vouchers").findOne({ voucher });
    if (voucherData) {
      const now = new Date();
      if (
        now >= new Date(voucherData.beginAt) &&
        now <= new Date(voucherData.endAt)
      ) {
        finalTotal = finalTotal * (1 - voucherData.sale / 100);
      }
    }
  }

  // Cập nhật điểm tích lũy cho khách hàng
  await db
    .collection("customers")
    .updateOne(
      { phone },
      { $set: { point: customer.point + pointsEarned, updatedAt: new Date() } }
    );

  // Cập nhật số lượng tồn kho và xóa sản phẩm nếu stock = 0
  for (const item of items) {
    const product = await db
      .collection("products")
      .findOne({ name: item.TenSanPham });
    if (product) {
      const newStock = product.stock - item.SoLuong;
      if (newStock <= 0) {
        await db.collection("products").deleteOne({ _id: product._id });
      } else {
        await db
          .collection("products")
          .updateOne({ _id: product._id }, { $set: { stock: newStock } });
      }
    }
  }

  // Tạo hóa đơn
  const newBill = {
    username,
    voucher: voucher || null,
    phone,
    Items: items,
    TongTien: finalTotal,
    createdAt: new Date(),
  };
  const result = await db.collection("bills").insertOne(newBill);

  res
    .status(201)
    .json({ message: "Hóa đơn đã được tạo", billId: result.insertedId });
};

// Thêm voucher
addVoucher = async (req, res) => {
  const db = mongoose.connection.db;
  const newVoucher = req.body;
  newVoucher.beginAt = new Date(newVoucher.beginAt);
  newVoucher.endAt = new Date(newVoucher.endAt);
  await db.collection("vouchers").insertOne(newVoucher);
  res.status(201).json({ message: "Voucher added" });
};

// Xóa voucher
deleteVoucher = async (req, res) => {
  const db = mongoose.connection.db;
  await db
    .collection("vouchers")
    .deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
  res.status(200).json({ message: "Voucher deleted" });
};

// Lấy chi tiết hóa đơn
getBillDetails = async (req, res) => {
  const db = mongoose.connection.db;
  const bill = await db
    .collection("bills")
    .findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
  res.json(bill);
};

// Trang đăng nhập
getLogin = (req, res) => {
  res.render("login", { layout: false, error: null });
};

// Xử lý đăng nhập
postLogin = async (req, res) => {
  const db = mongoose.connection.db;
  const { TenTaiKhoan, MatKhau } = req.body;

  try {
    const user = await db
      .collection("users")
      .findOne({ username: TenTaiKhoan });
    if (!user) {
      return res.render("login", {
        layout: false,
        error: "Tên đăng nhập không tồn tại",
      });
    }

    const isMatch = await bcrypt.compare(MatKhau, user.password);
    if (!isMatch) {
      return res.render("login", {
        layout: false,
        error: "Mật khẩu không đúng",
      });
    }

    req.session.user = user;
    res.redirect("/");
  } catch (error) {
    res.render("login", {
      layout: false,
      error: "Đã có lỗi xảy ra, vui lòng thử lại",
    });
  }
};

// Đăng xuất
logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.redirect("/");
    }
    res.redirect("/login");
  });
};
module.exports = {
  getCustomers,
  getProducts,
  addProduct,
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  getVouchers,
  getBills,
  getCreateBill,
  checkVoucher,
  checkCustomer,
  createBill,
  addVoucher,
  deleteVoucher,
  getBillDetails,
  getLogin,
  postLogin,
  logout,
};
