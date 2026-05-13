import { Response } from "express";

export function ok(res: Response, data?: unknown, message = "Success") {
  res.json({ success: true, message, data });
}

export function fail(res: Response, status: number, message: string) {
  res.status(status).json({ success: false, message });
}
