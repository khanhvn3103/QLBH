const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  createdAt: Date,
});

const billSchema = new mongoose.Schema({
  username: String,
  voucher: String,
  phone: String,
  Items: [
    {
      MaSanPham: String,
      TenSanPham: String,
      SoLuong: Number,
      ThanhTien: Number,
    },
  ],
  TongTien: Number,
  createdAt: Date,
});

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number,
  createdAt: Date,
  updatedAt: Date,
});

const customerSchema = new mongoose.Schema({
  name: String,
  phone: String,
  point: Number,
  createdAt: Date,
  updatedAt: Date,
});

const voucherSchema = new mongoose.Schema({
  voucher: String,
  sale: Number,
  beginAt: Date,
  endAt: Date,
});

const User = mongoose.model("User", userSchema);
const Bill = mongoose.model("Bill", billSchema);
const Product = mongoose.model("Product", productSchema);
const Customer = mongoose.model("Customer", customerSchema);
const Voucher = mongoose.model("Voucher", voucherSchema);

module.exports = { User, Bill, Product, Customer, Voucher };
