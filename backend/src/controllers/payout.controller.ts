import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Payout } from "../models/Payout";
import { Vendor } from "../models/Vendor";
import { Audit } from "../models/Audit";
import { ok, fail } from "../utils/response";

export async function getPayouts(req: AuthRequest, res: Response) {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.vendor) filter.vendor_id = req.query.vendor;

    const payouts = await Payout.find(filter)
      .populate("vendor_id", "name upi_id bank_account ifsc")
      .populate("created_by", "email name role")
      .populate("submitted_by", "email name")
      .populate("approved_by", "email name")
      .populate("rejected_by", "email name")
      .sort({ createdAt: -1 });

    ok(res, payouts);
  } catch {
    fail(res, 500, "Internal server error");
  }
}

export async function getPayoutById(req: AuthRequest, res: Response) {
  try {
    const payout = await Payout.findById(req.params.id)
      .populate("vendor_id", "name upi_id bank_account ifsc is_active")
      .populate("created_by", "email name role")
      .populate("submitted_by", "email name")
      .populate("approved_by", "email name")
      .populate("rejected_by", "email name");

    if (!payout) {
      fail(res, 404, "Payout not found");
      return;
    }

    const audits = await Audit.find({ payout_id: payout._id })
      .populate("performed_by", "email name")
      .sort({ timestamp: -1 });

    ok(res, { payout, audits });
  } catch {
    fail(res, 500, "Internal server error");
  }
}

export async function createPayout(req: AuthRequest, res: Response) {
  const { vendor_id, amount, mode, note } = req.body;

  try {
    const vendor = await Vendor.findById(vendor_id);
    if (!vendor) {
      fail(res, 404, "Vendor not found");
      return;
    }
    if (!vendor.is_active) {
      fail(res, 400, "Cannot create payout for an inactive vendor");
      return;
    }

    const payout = await Payout.create({
      vendor_id,
      amount,
      mode,
      note,
      status: "Draft",
      created_by: req.user!.id,
    });

    await Audit.create({
      payout_id: payout._id,
      action: "CREATED",
      performed_by: req.user!.id,
      role: req.user!.role,
      timestamp: new Date(),
    });

    ok(res, payout, "Payout draft created");
  } catch {
    fail(res, 500, "Internal server error");
  }
}

export async function submitPayout(req: AuthRequest, res: Response) {
  try {
    const payout = await Payout.findById(req.params.id);
    if (!payout) { fail(res, 404, "Payout not found"); return; }

    if (payout.status !== "Draft") {
      fail(res, 400, `Cannot submit a payout with status "${payout.status}"`);
      return;
    }

    payout.status = "Submitted";
    payout.submitted_by = req.user!.id as unknown as typeof payout.submitted_by;
    payout.submitted_at = new Date();
    await payout.save();

    await Audit.create({
      payout_id: payout._id,
      action: "SUBMITTED",
      performed_by: req.user!.id,
      role: req.user!.role,
      timestamp: new Date(),
    });

    ok(res, payout, "Payout submitted for approval");
  } catch {
    fail(res, 500, "Internal server error");
  }
}

export async function approvePayout(req: AuthRequest, res: Response) {
  try {
    const payout = await Payout.findById(req.params.id);
    if (!payout) { fail(res, 404, "Payout not found"); return; }

    if (payout.status !== "Submitted") {
      fail(res, 400, `Cannot approve a payout with status "${payout.status}"`);
      return;
    }

    payout.status = "Approved";
    payout.approved_by = req.user!.id as unknown as typeof payout.approved_by;
    payout.approved_at = new Date();
    await payout.save();

    await Audit.create({
      payout_id: payout._id,
      action: "APPROVED",
      performed_by: req.user!.id,
      role: req.user!.role,
      timestamp: new Date(),
    });

    ok(res, payout, "Payout approved successfully");
  } catch {
    fail(res, 500, "Internal server error");
  }
}

export async function rejectPayout(req: AuthRequest, res: Response) {
  const { reason } = req.body;

  try {
    const payout = await Payout.findById(req.params.id);
    if (!payout) { fail(res, 404, "Payout not found"); return; }

    if (payout.status !== "Submitted") {
      fail(res, 400, `Cannot reject a payout with status "${payout.status}"`);
      return;
    }

    payout.status = "Rejected";
    payout.decision_reason = reason;
    payout.rejected_by = req.user!.id as unknown as typeof payout.rejected_by;
    payout.rejected_at = new Date();
    await payout.save();

    await Audit.create({
      payout_id: payout._id,
      action: "REJECTED",
      performed_by: req.user!.id,
      role: req.user!.role,
      note: reason,
      timestamp: new Date(),
    });

    ok(res, payout, "Payout rejected");
  } catch {
    fail(res, 500, "Internal server error");
  }
}
