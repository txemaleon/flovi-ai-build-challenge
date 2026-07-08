import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const requiredEnv = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DEMO_DISPATCHER_USER_ID",
  "DEMO_DRIVER_USER_ID"
];

const missing = requiredEnv.filter((name) => !process.env[name]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const source = await readFile(
  new URL("../packages/core/src/relocations/demo/demo-relocation-requests.ts", import.meta.url),
  "utf8"
);
const match = source.match(
  /export const demoRelocationRequests = (\[[\s\S]*?\]) as const satisfies/
);

if (!match) {
  throw new Error("Unable to read shared demo relocation dataset.");
}

const demoDispatcherId = "demo-dispatcher";
const demoDriverId = "demo-driver";
const secondaryDemoDriverId = "demo-driver-2";
const demoRelocationRequests = Function(
  "demoDispatcherId",
  "demoDriverId",
  "secondaryDemoDriverId",
  `return ${match[1]};`
)(demoDispatcherId, demoDriverId, secondaryDemoDriverId);

const dispatcherId = process.env.DEMO_DISPATCHER_USER_ID;
const primaryDriverId = process.env.DEMO_DRIVER_USER_ID;
const secondaryDriverId =
  process.env.DEMO_SECONDARY_DRIVER_USER_ID || primaryDriverId;

const rows = demoRelocationRequests.map((request) => ({
  id: uuidFromSeed(request.id),
  dispatcher_id: dispatcherId,
  origin: request.origin,
  destination: request.destination,
  scheduled_at: request.scheduledAt,
  notes: request.notes,
  status: request.status,
  driver_id: mapDriverId(request.driverId)
}));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);
const { error } = await supabase
  .from("relocation_requests")
  .upsert(rows, { onConflict: "id" });

if (error) {
  throw new Error(`Unable to seed demo relocation requests: ${error.message}`);
}

console.log(`Seeded ${rows.length} demo relocation requests.`);

function mapDriverId(driverId) {
  if (!driverId) {
    return null;
  }

  return driverId === secondaryDemoDriverId ? secondaryDriverId : primaryDriverId;
}

function uuidFromSeed(seed) {
  const hex = createHash("sha1").update(`flovi:${seed}`).digest("hex");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `${((Number.parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80).toString(16)}${hex.slice(18, 20)}`,
    hex.slice(20, 32)
  ].join("-");
}
