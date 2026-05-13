import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export function allowRoles(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    next();
  };
}
