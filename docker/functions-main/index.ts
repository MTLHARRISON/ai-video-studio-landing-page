// Router for the self-hosted edge runtime: dispatches /functions/v1/<name>
// to supabase/functions/<name>/index.ts inside a per-request worker.
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";

const JWT_SECRET = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const VERIFY_JWT = Deno.env.get("VERIFY_JWT") === "true";

serve(async (req: Request) => {
  const url = new URL(req.url);
  const name = url.pathname.replace(/^\/+/, "").split("/")[0];

  if (!name || name === "main") {
    return new Response(JSON.stringify({ error: "function name required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const servicePath = `/home/deno/functions/${name}`;

  try {
    // @ts-expect-error provided by the Supabase edge runtime
    const worker = await EdgeRuntime.userWorkers.create({
      servicePath,
      memoryLimitMb: 256,
      workerTimeoutMs: 5 * 60 * 1000,
      noModuleCache: false,
      envVars: Object.entries(Deno.env.toObject()),
      forceCreate: false,
      cpuTimeSoftLimitMs: 10_000,
      cpuTimeHardLimitMs: 20_000,
      jwtSecret: JWT_SECRET,
      verifyJwt: VERIFY_JWT,
    });
    return await worker.fetch(req);
  } catch (error) {
    console.error(`failed to invoke ${name}:`, error);
    return new Response(
      JSON.stringify({ error: `function "${name}" not found or failed to start` }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
