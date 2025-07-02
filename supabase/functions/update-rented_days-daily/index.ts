// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Edge function to refresh rented days of closed non-chip asset associations

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Missing Supabase environment variables" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  })

  const today = new Date().toISOString().slice(0, 10)

  const { data: assocRows, error: assocError } = await supabase
    .from("asset_client_assoc")
    .select("asset_id, assets(solution_id)")
    .lte("exit_date", today)
    .not("exit_date", "is", null)
    .is("deleted_at", null)

  if (assocError) {
    return new Response(
      JSON.stringify({ error: assocError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }

  type AssocRow = {
    asset_id: string
    assets: { solution_id: number | null } | null
  }

  const assetIds = Array.from(
    new Set(
      ((assocRows ?? []) as AssocRow[])
        .filter((row) => row.assets?.solution_id !== 11)
        .map((row) => row.asset_id),
    ),
  )

  const updates: Array<{ asset_id: string; error?: string }> = []

  for (const id of assetIds) {
    const { error } = await supabase.rpc("update_asset_rented_days", {
      asset_uuid: id,
    })

    if (error) {
      updates.push({ asset_id: id, error: error.message })
    } else {
      updates.push({ asset_id: id })
    }
  }

  const { data: integrityData, error: integrityError } = await supabase.rpc(
    "validate_rented_days_integrity",
  )

  const response = {
    processed_assets: assetIds.length,
    updates,
    integrity_error: integrityError?.message ?? null,
    integrity_result: integrityData ?? null,
  }

  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json" },
  })
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/update-rented_days-daily' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
