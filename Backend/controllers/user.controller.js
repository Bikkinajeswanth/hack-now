import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const {
      email,
      password,
      college,
      collegeId,
      fullName,
      paymentId,
      paymentScreenshot,
      state,
      address,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      fullName,
      state,
      address,
      paymentId,
      paymentScreenshot,
      paymentStatus: "pending",
      isApproved: false,
      registrationData: {
        originalPassword: password,
        fullName: fullName,
      },
    });

    console.log("Created registration:", {
      email: newUser.email,
      hasRegistrationData: !!newUser.registrationData,
      registrationData: newUser.registrationData,
    });

    res.status(201).json({
      message: "Registration pending admin approval",
      email: newUser.email,
      paymentStatus: "pending",
      role: newUser.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (!user.isApproved) {
      if (user.paymentStatus === "rejected") {
        return res.status(403).json({
          error: "Your registration has been rejected. Please contact support.",
          status: "rejected",
        });
      }
      if (user.paymentStatus === "pending") {
        return res.status(403).json({
          error:
            "Your registration is pending approval. Please wait for admin confirmation.",
          status: "pending",
        });
      }
    }

    // Debug logs
    console.log("Login attempt:", {
      email,
      providedPassword: password,
      storedHashedPassword: user.password,
    });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      state: user.state,
      address: user.address,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};