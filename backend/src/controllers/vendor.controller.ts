import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Vendor } from "../models/Vendor";
import { ok, fail } from "../utils/response";

export async function getVendors(_req: AuthRequest, res: Response) {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    ok(res, vendors);
  } catch {
    fail(res, 500, "Internal server error");
  }
}

export async function createVendor(req: AuthRequest, res: Response) {
  const { name, upi_id, bank_account, ifsc } = req.body;

  try {
    const vendor = await Vendor.create({
      name,
      upi_id: upi_id || undefined,
      bank_account: bank_account || undefined,
      ifsc: ifsc ? ifsc.toUpperCase() : undefined,
    });
    ok(res, vendor, "Vendor created successfully");
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      fail(res, 409, "A vendor with this name already exists");
      return;
    }
    fail(res, 500, "Internal server error");
  }
}
