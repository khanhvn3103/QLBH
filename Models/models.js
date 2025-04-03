const mongoose = require("mongoose");

// User Model
const UserSchema = new mongoose.Schema({
  _id: String,
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", UserSchema);

// Bill Model
const BillSchema = new mongoose.Schema({
  userId: { type: String, ref: "User", required: true },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Bill = mongoose.model("Bill", BillSchema);

// Product Model
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
const Product = mongoose.model("Product", ProductSchema);

// Customer Model
const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, unique: true, required: true },
  point: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
const Customer = mongoose.model("Customer", CustomerSchema);

// Voucher Model
const VoucherSchema = new mongoose.Schema({
  voucher: { type: String, unique: true, required: true },
  sale: { type: Number, required: true },
  beginAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
});
const Voucher = mongoose.model("Voucher", VoucherSchema);

module.exports = { User, Bill, Product, Customer, Voucher };
