import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/User";
import { Vendor } from "../models/Vendor";
import { Payout } from "../models/Payout";
import { Audit } from "../models/Audit";

dotenv.config();

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error("MONGODB_URI not set"); process.exit(1); }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Vendor.deleteMany({}),
    Payout.deleteMany({}),
    Audit.deleteMany({}),
  ]);
  console.log("Cleared existing data");

  // Create users
  const [opsUser, financeUser] = await Promise.all([
    User.create({ email: "ops@demo.com", password: "ops123", role: "OPS", name: "Ops User" }),
    User.create({ email: "finance@demo.com", password: "fin123", role: "FINANCE", name: "Finance User" }),
  ]);
  console.log("Users created");

  // Create vendors
  const [vendor1, vendor2, vendor3] = await Promise.all([
    Vendor.create({ name: "TechCorp Supplies", upi_id: "techcorp@hdfc", bank_account: "1234567890", ifsc: "HDFC0001234", is_active: true }),
    Vendor.create({ name: "Global Logistics Ltd", bank_account: "9876543210", ifsc: "ICIC0005678", is_active: true }),
    Vendor.create({ name: "Office Essentials", upi_id: "office@sbi", is_active: true }),
  ]);
  console.log("Vendors created");

  // Create sample payouts
  const p1 = await Payout.create({
    vendor_id: vendor1._id,
    amount: 50000,
    mode: "NEFT",
    note: "November invoice settlement",
    status: "Approved",
    created_by: opsUser._id,
    submitted_by: opsUser._id,
    approved_by: financeUser._id,
    submitted_at: new Date("2024-12-10"),
    approved_at: new Date("2024-12-11"),
  });

  const p2 = await Payout.create({
    vendor_id: vendor2._id,
    amount: 12500,
    mode: "IMPS",
    note: "Delivery charges Q4",
    status: "Submitted",
    created_by: opsUser._id,
    submitted_by: opsUser._id,
    submitted_at: new Date("2024-12-20"),
  });

  const p3 = await Payout.create({
    vendor_id: vendor3._id,
    amount: 8000,
    mode: "UPI",
    note: "Office stationery",
    status: "Draft",
    created_by: opsUser._id,
  });

  const p4 = await Payout.create({
    vendor_id: vendor1._id,
    amount: 30000,
    mode: "NEFT",
    status: "Rejected",
    decision_reason: "Duplicate payment request — already processed in Nov batch",
    created_by: opsUser._id,
    submitted_by: opsUser._id,
    rejected_by: financeUser._id,
    submitted_at: new Date("2024-12-15"),
    rejected_at: new Date("2024-12-16"),
  });

  console.log("Payouts created");

  // Create audit trail
  await Audit.insertMany([
    { payout_id: p1._id, action: "CREATED", performed_by: opsUser._id, role: "OPS", timestamp: new Date("2024-12-09T09:00:00") },
    { payout_id: p1._id, action: "SUBMITTED", performed_by: opsUser._id, role: "OPS", timestamp: new Date("2024-12-10T10:00:00") },
    { payout_id: p1._id, action: "APPROVED", performed_by: financeUser._id, role: "FINANCE", timestamp: new Date("2024-12-11T11:00:00") },
    { payout_id: p2._id, action: "CREATED", performed_by: opsUser._id, role: "OPS", timestamp: new Date("2024-12-19T09:00:00") },
    { payout_id: p2._id, action: "SUBMITTED", performed_by: opsUser._id, role: "OPS", timestamp: new Date("2024-12-20T10:00:00") },
    { payout_id: p3._id, action: "CREATED", performed_by: opsUser._id, role: "OPS", timestamp: new Date("2024-12-22T09:00:00") },
    { payout_id: p4._id, action: "CREATED", performed_by: opsUser._id, role: "OPS", timestamp: new Date("2024-12-14T09:00:00") },
    { payout_id: p4._id, action: "SUBMITTED", performed_by: opsUser._id, role: "OPS", timestamp: new Date("2024-12-15T10:00:00") },
    { payout_id: p4._id, action: "REJECTED", performed_by: financeUser._id, role: "FINANCE", note: "Duplicate payment request", timestamp: new Date("2024-12-16T11:00:00") },
  ]);

  console.log("Audit trail created");
  console.log("\n✅ Seed complete!");
  console.log("   OPS login:     ops@demo.com / ops123");
  console.log("   Finance login: finance@demo.com / fin123\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
