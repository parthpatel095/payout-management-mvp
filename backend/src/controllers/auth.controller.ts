import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { ok, fail } from "../utils/response";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      fail(res, 401, "Invalid credentials");
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      fail(res, 401, "Invalid credentials");
      return;
    }

    const secret = process.env.JWT_SECRET!;
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role, name: user.name },
      secret,
      { expiresIn } as jwt.SignOptions
    );

    ok(res, {
      token,
      user: { id: user._id.toString(), email: user.email, role: user.role, name: user.name },
    }, "Login successful");
  } catch (err) {
    console.error("Login error:", err);
    fail(res, 500, "Internal server error");
  }
}
