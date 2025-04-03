// Controllers/userController.js
const { User, Bill, Product, Customer, Voucher } = require("../Models/models");
const bcrypt = require("bcrypt");

// Quản lý khách hàng
getCustomers = async (req, res) => {
  const customers = await Customer.find().sort({ point: 1 });
  res.render("QuanLyKhachHang", { title: "Quản Lý Khách Hàng", customers });
};

// Quản lý sản phẩm
getProducts = async (req, res) => {
  const products = await Product.find({ stock: { $gt: 0 } }).sort({ stock: 1 });
  res.render("QuanLySanPham", { title: "Quản Lý Sản Phẩm", products });
};

// Thêm sản phẩm
addProduct = async (req, res) => {
  const { name, price, stock } = req.body;
  const newProduct = new Product({
    name,
    price: parseFloat(price),
    stock: parseInt(stock),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await newProduct.save();
  res.status(201).json({ message: "Sản phẩm đã được thêm" });
};

// Quản lý người dùng
getUsers = async (req, res) => {
  const users = await User.find().sort({ name: 1 });
  res.render("QuanLyTaiKhoan", { title: "Quản Lý Người Dùng", users });
};

// Thêm người dùng
addUser = async (req, res) => {
  const { username, name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    name,
    email,
    password: hashedPassword,
    createdAt: new Date(),
  });
  await newUser.save();
  res.status(201).json({ message: "Người dùng đã được thêm" });
};

// Sửa người dùng
updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, name, email, password } = req.body;
  const updateData = { username, name, email };
  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }
  await User.findByIdAndUpdate(id, updateData);
  res.status(200).json({ message: "Người dùng đã được cập nhật" });
};

// Xóa người dùng
deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Người dùng đã được xóa" });
};

// Quản lý voucher
getVouchers = async (req, res) => {
  const vouchers = await Voucher.find();
  res.render("QuanLyVoucher", { title: "Quản Lý Voucher", vouchers });
};

// Quản lý hóa đơn
getBills = async (req, res) => {
  const bills = await Bill.find();
  const users = await User.find();
  const customers = await Customer.find();

  const billsWithDetails = await Promise.all(
    bills.map(async (bill) => {
      const seller = users.find((user) => user.username === bill.username);
      const buyer = customers.find((customer) => customer.phone === bill.phone);
      return {
        ...bill._doc,
        sellerName: seller ? seller.name : "Không xác định",
        buyerName: buyer ? buyer.name : "Không xác định",
      };
    })
  );

  res.render("DanhSachHoaDon", {
    title: "Danh Sách Hóa Đơn",
    bills: billsWithDetails,
  });
};

// Trang tạo hóa đơn (Trang chủ)
getCreateBill = async (req, res) => {
  const products = await Product.find({ stock: { $gt: 0 } });
  const customers = await Customer.find();
  const user = req.session.user;
  res.render("BanHang", { title: "Tạo Hóa Đơn", products, customers, user });
};

// Kiểm tra mã giảm giá
checkVoucher = async (req, res) => {
  const { voucherCode } = req.body;
  const voucher = await Voucher.findOne({ voucher: voucherCode });
  if (voucher) {
    const now = new Date();
    if (now >= voucher.beginAt && now <= voucher.endAt) {
      return res.json({ valid: true, sale: voucher.sale });
    }
  }
  res.json({ valid: false });
};

// Kiểm tra khách hàng
checkCustomer = async (req, res) => {
  const { phone } = req.body;
  const customer = await Customer.findOne({ phone });
  if (customer) {
    res.json({ name: customer.name, point: customer.point });
  } else {
    res.json({ name: "", point: 0 });
  }
};

// Tạo hóa đơn
createBill = async (req, res) => {
  const { username, phone, customerName, voucher, items, totalPrice } =
    req.body;

  // Tìm hoặc tạo khách hàng
  let customer = await Customer.findOne({ phone });
  if (!customer) {
    customer = new Customer({
      name: customerName || "Khách vãng lai",
      phone,
      point: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Tính điểm tích lũy (10 điểm cho mỗi 10,000 VND)
  let finalTotal = parseFloat(totalPrice);
  let pointsEarned = Math.floor(finalTotal / 10000) * 10;

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
    const voucherData = await Voucher.findOne({ voucher });
    if (voucherData) {
      const now = new Date();
      if (now >= voucherData.beginAt && now <= voucherData.endAt) {
        finalTotal = finalTotal * (1 - voucherData.sale / 100);
      }
    }
  }

  // Cập nhật điểm tích lũy cho khách hàng
  customer.point += pointsEarned;
  customer.updatedAt = new Date();
  await customer.save();

  // Cập nhật số lượng tồn kho và xóa sản phẩm nếu stock = 0
  for (const item of items) {
    const product = await Product.findOne({ name: item.TenSanPham });
    if (product) {
      product.stock -= item.SoLuong;
      if (product.stock <= 0) {
        await Product.deleteOne({ _id: product._id });
      } else {
        await product.save();
      }
    }
  }

  // Tạo hóa đơn
  const newBill = new Bill({
    username,
    voucher: voucher || null,
    phone,
    Items: items,
    TongTien: finalTotal,
    createdAt: new Date(),
  });
  await newBill.save();

  res.status(201).json({ message: "Hóa đơn đã được tạo", billId: newBill._id });
};

// Thêm voucher
addVoucher = async (req, res) => {
  const newVoucher = new Voucher(req.body);
  await newVoucher.save();
  res.status(201).json({ message: "Voucher added" });
};

// Xóa voucher
deleteVoucher = async (req, res) => {
  await Voucher.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Voucher deleted" });
};

// Lấy chi tiết hóa đơn
getBillDetails = async (req, res) => {
  const bill = await Bill.findById(req.params.id);
  res.json(bill);
};

// Trang đăng nhập
getLogin = (req, res) => {
  res.render("login", { layout: false, error: null });
};

// Xử lý đăng nhập
postLogin = async (req, res) => {
  const { TenTaiKhoan, MatKhau } = req.body;

  try {
    const user = await User.findOne({ username: TenTaiKhoan });
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
