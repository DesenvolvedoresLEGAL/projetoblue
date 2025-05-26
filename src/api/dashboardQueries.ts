
import { supabase } from '@/integrations/supabase/client';

// Fetch total assets count
export async function fetchTotalAssets() {
  console.log('Executing fetchTotalAssets query');
  const result = await supabase
    .from('assets')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);
  
  console.log('fetchTotalAssets result:', result);
  return result;
}

// Fetch active clients count
export async function fetchActiveClients() {
  console.log('Executing fetchActiveClients query');
  const result = await supabase
    .from('v_active_clients')
    .select('*', { count: 'exact', head: true });
  
  console.log('fetchActiveClients result:', result);
  return result;
}

// Fetch assets with issues count
export async function fetchAssetsWithIssues() {
  console.log('Executing fetchAssetsWithIssues query');
  const result = await supabase
    .from('v_problem_assets')
    .select('*', { count: 'exact', head: true });
  
  console.log('fetchAssetsWithIssues result:', result);
  return result;
}

// Fetch recent assets
export async function fetchRecentAssets() {
  console.log('Executing fetchRecentAssets query');
  const result = await supabase
    .from('assets')
    .select(`
      uuid, serial_number, iccid, line_number, radio, solution_id, status_id, model
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(5);
  
  console.log('fetchRecentAssets result:', result);
  return result;
}

// Fetch recent events
export async function fetchRecentEvents() {
  console.log('Executing fetchRecentEvents query');
  const result = await supabase
    .from('asset_logs')
    .select('id, event, date, details')
    .order('date', { ascending: false })
    .limit(5);
  
  console.log('fetchRecentEvents result:', result);
  return result;
}

// Fetch status breakdown
export async function fetchStatusBreakdown() {
  console.log('Executing fetchStatusBreakdown query');
  const result = await supabase
    .rpc('status_by_asset_type');
  
  console.log('fetchStatusBreakdown result:', result);
  return result;
}

// Fetch solutions data
export async function fetchSolutions() {
  console.log('Executing fetchSolutions query');
  const result = await supabase
    .from('asset_solutions')
    .select('id, solution');
  
  console.log('fetchSolutions result:', result);
  return result;
}

// Fetch status data
export async function fetchStatuses() {
  console.log('Executing fetchStatuses query');
  const result = await supabase
    .from('asset_status')
    .select('id, status');
  
  console.log('fetchStatuses result:', result);
  return result;
}

// NEW: Fetch aggregated data by status only (for PieChart)
export async function fetchStatusSummary() {
  console.log('Executing fetchStatusSummary query');
  const result = await supabase
    .from('assets')
    .select(`
      status_id,
      asset_status!inner(status)
    `)
    .is('deleted_at', null);
  
  console.log('fetchStatusSummary result:', result);
  return result;
}

// NEW: Fetch detailed breakdown by type and status (for tooltip)
export async function fetchDetailedStatusBreakdown() {
  console.log('Executing fetchDetailedStatusBreakdown query');
  const result = await supabase
    .from('assets')
    .select(`
      solution_id,
      status_id,
      asset_solutions!inner(solution),
      asset_status!inner(status)
    `)
    .is('deleted_at', null);
  
  console.log('fetchDetailedStatusBreakdown result:', result);
  return result;
}
