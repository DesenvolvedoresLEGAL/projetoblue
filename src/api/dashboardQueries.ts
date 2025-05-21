
import { supabase } from '@/integrations/supabase/client';

// Fetch total assets count
export async function fetchTotalAssets() {
  return await supabase
    .from('assets')
    .select('*', { count: 'exact', head: true });
}

// Fetch active clients count
export async function fetchActiveClients() {
  return await supabase
    .from('v_active_clients')
    .select('*', { count: 'exact', head: true });
}

// Fetch assets with issues count
export async function fetchAssetsWithIssues() {
  return await supabase
    .from('v_problem_assets')
    .select('*', { count: 'exact', head: true });
}

// Fetch recent assets
export async function fetchRecentAssets() {
  return await supabase
    .from('assets')
    .select(`
      uuid, serial_number, line_number, radio, solution_id, status_id
    `)
    .order('created_at', { ascending: false })
    .limit(5);
}

// Fetch recent events
export async function fetchRecentEvents() {
  return await supabase
    .from('asset_logs')
    .select('id, event, date, details')
    .order('date', { ascending: false })
    .limit(5);
}

// Fetch status breakdown
export async function fetchStatusBreakdown() {
  return await supabase
    .rpc('status_by_asset_type');
}

// Fetch solutions data
export async function fetchSolutions() {
  return await supabase
    .from('asset_solutions')
    .select('id, solution');
}

// Fetch status data
export async function fetchStatuses() {
  return await supabase
    .from('asset_status')
    .select('id, status');
}
