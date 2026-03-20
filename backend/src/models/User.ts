import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ["customer", "service_provider"], required: true },
  businessName: String,
  category: String,
  address: String,
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function () {
  const user = this as any;

  if (!user.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;