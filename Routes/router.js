// Routes/user.js
const express = require("express");
const router = express.Router();
const Controller = require("../Controllers/Controller");

router.get("/customers", Controller.getCustomers);
router.get("/products", Controller.getProducts);
router.post("/products/add", Controller.addProduct); // Thêm route mới
router.get("/users", Controller.getUsers);
router.post("/users/add", Controller.addUser);
router.put("/users/update/:id", Controller.updateUser);
router.delete("/users/delete/:id", Controller.deleteUser);
router.get("/vouchers", Controller.getVouchers);
router.get("/bills", Controller.getBills);
router.post("/vouchers/add", Controller.addVoucher);
router.delete("/vouchers/delete/:id", Controller.deleteVoucher);
router.get("/bills/:id", Controller.getBillDetails);
router.get("/", Controller.getCreateBill);
router.post("/create-bill", Controller.createBill);
router.post("/check-voucher", Controller.checkVoucher);
router.post("/check-customer", Controller.checkCustomer);
router.get("/login", Controller.getLogin);
router.post("/login", Controller.postLogin);
router.get("/logout", Controller.logout);

module.exports = router;
