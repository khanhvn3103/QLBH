// hashPasswords.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./Models/models").User;

mongoose
  .connect("mongodb://localhost:27017/QLBH", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB");
    const users = await User.find();
    for (let user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await User.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );
      console.log(`Updated password for user: ${user.username}`);
    }
    console.log("All passwords have been hashed");
    mongoose.connection.close();
  })
  .catch((err) => console.error("MongoDB connection error:", err));
