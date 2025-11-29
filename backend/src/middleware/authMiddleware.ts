import type { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: "Missing auth header" });
  }

  const token = header.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & {
      id: string;
      email: string;
      role?: string;
    };

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};
