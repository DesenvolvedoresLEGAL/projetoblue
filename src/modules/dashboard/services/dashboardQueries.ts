import { supabase } from '@/integrations/supabase/client';

// Fetch total assets count
export async function fetchTotalAssets() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Executing fetchTotalAssets query');
  }
  const result = await supabase
    .from('assets')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('fetchTotalAssets result:', result);
  }
  return result;
}

// Fetch active clients count
export async function fetchActiveClients() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Executing fetchActiveClients query');
  }
  const result = await supabase
    .from('v_active_clients')
    .select('*', { count: 'exact', head: true });
  
  if (process.env.NODE_ENV === 'development') {
    console.log('fetchActiveClients result:', result);
  }
  return result;
}

// Fetch assets with issues count
export async function fetchAssetsWithIssues() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Executing fetchAssetsWithIssues query');
  }
  const result = await supabase
    .from('v_problem_assets')
    .select('*', { count: 'exact', head: true });
  
  if (process.env.NODE_ENV === 'development') {
    console.log('fetchAssetsWithIssues result:', result);
  }
  return result;
}

// Fetch recent assets
export async function fetchRecentAssets() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Executing fetchRecentAssets query');
  }
  const result = await supabase
    .from('assets')
    .select(`
      uuid, serial_number, iccid, line_number, radio, solution_id, status_id, model
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('fetchRecentAssets result:', result);
  }
  return result;
}

// Fetch recent events
export async function fetchRecentEvents() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Executing fetchRecentEvents query');
  }
  const result = await supabase
    .from('asset_logs')
    .select('id, event, date, details')
    .order('date', { ascending: false })
    .limit(5);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('fetchRecentEvents result:', result);
  }
  return result;
}

// Fetch status breakdown
export async function fetchStatusBreakdown() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Executing fetchStatusBreakdown query');
  }
  const result = await supabase
    .rpc('status_by_asset_type');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('fetchStatusBreakdown result:', result);
  }
  return result;
}

// Fetch solutions data
export async function fetchSolutions() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Executing fetchSolutions query');
  }
  const result = await supabase
    .from('asset_solutions')
    .select('id, solution');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('fetchSolutions result:', result);
  }
  return result;
}

// Fetch status data
export async function fetchStatuses() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Executing fetchStatuses query');
  }
  const result = await supabase
    .from('asset_status')
    .select('id, status');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('fetchStatuses result:', result);
  }
  return result;
}

// NEW: Fetch aggregated data by status only (for PieChart)
export async function fetchStatusSummary() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Executing fetchStatusSummary query');
  }
  const result = await supabase
    .from('assets')
    .select(`
      status_id,
      asset_status!inner(status)
    `)
    .is('deleted_at', null);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('fetchStatusSummary result:', result);
  }
  return result;
}

// NEW: Fetch detailed breakdown by type and status (for tooltip)
export async function fetchDetailedStatusBreakdown() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Executing fetchDetailedStatusBreakdown query');
  }
  const result = await supabase
    .from('assets')
    .select(`
      solution_id,
      status_id,
      asset_solutions!inner(solution),
      asset_status!inner(status)
    `)
    .is('deleted_at', null);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('fetchDetailedStatusBreakdown result:', result);
  }
  return result;
}

// NEW: Fetch active associations - OTIMIZADO para evitar N+1 queries
export async function fetchActiveAssociations() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Executing fetchActiveAssociations query (optimized)');
  }
  const result = await supabase
    .from('asset_client_assoc')
    .select(`
      id,
      asset_id,
      client_id,
      association_id,
      entry_date,
      exit_date,
      clients!inner(empresa),
      association_types!inner(type),
      assets!inner(
        uuid,
        serial_number,
        radio,
        line_number,
        rented_days,
        status_id,
        solution_id,
        asset_solutions!inner(solution),
        asset_status!inner(status)
      )
    `)
    .is('exit_date', null)
    .is('deleted_at', null);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('fetchActiveAssociations result (optimized):', result);
  }
  return result;
}

// NEW: Fetch associations ending today
export async function fetchAssociationsEndingToday() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Executing fetchAssociationsEndingToday query');
  }
  const today = new Date().toISOString().split('T')[0];
  const result = await supabase
    .from('asset_client_assoc')
    .select(`
      id,
      asset_id,
      client_id,
      association_id,
      entry_date,
      exit_date,
      clients!inner(empresa),
      association_types!inner(type)
    `)
    .eq('exit_date', today)
    .is('deleted_at', null);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('fetchAssociationsEndingToday result:', result);
  }
  return result;
}

// NEW: Fetch top clients with associations
export async function fetchTopClientsWithAssociations() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Executing fetchTopClientsWithAssociations query');
  }
  const result = await supabase
    .from('asset_client_assoc')
    .select(`
      client_id,
      clients!inner(empresa)
    `)
    .is('exit_date', null)
    .is('deleted_at', null);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('fetchTopClientsWithAssociations result:', result);
  }
  return result;
}

// NEW: Fetch associations from last 30 days
export async function fetchAssociationsLast30Days() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Executing fetchAssociationsLast30Days query');
  }
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const result = await supabase
    .from('asset_client_assoc')
    .select(`
      id,
      association_id,
      entry_date,
      exit_date,
      created_at,
      association_types!inner(type)
    `)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .is('deleted_at', null);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('fetchAssociationsLast30Days result:', result);
  }
  return result;
}

// NEW: Enhanced recent events with user information
export async function fetchEnhancedRecentEvents() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Executing fetchEnhancedRecentEvents query');
  }
  
  // First get the events
  const eventsResult = await supabase
    .from('asset_logs')
    .select('id, event, date, details, status_before_id, status_after_id')
    .in('event', ['ASSET_CRIADO', 'ASSOCIATION_CREATED', 'ASSOCIATION_REMOVED', 'STATUS_UPDATED'])
    .order('date', { ascending: false })
    .limit(10);
  
  if (eventsResult.error) {
    if (process.env.NODE_ENV === 'development') {
      console.log('fetchEnhancedRecentEvents error:', eventsResult.error);
    }
    return eventsResult;
  }

  // Extract unique user IDs from event details
  const userIds = new Set<string>();
  eventsResult.data?.forEach(event => {
    const details = event.details as any;
    if (details?.user_id && details.user_id !== '00000000-0000-0000-0000-000000000000') {
      userIds.add(details.user_id);
    }
  });

  // Fetch user profiles if we have user IDs
  const usersMap = new Map<string, string>();
  if (userIds.size > 0) {
    const usersResult = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', Array.from(userIds));
    
    if (usersResult.data) {
      usersResult.data.forEach(user => {
        usersMap.set(user.id, user.email);
      });
    }
  }

  // Add user information to events
  const enrichedData = eventsResult.data?.map(event => ({
    ...event,
    user_email: (() => {
      const details = event.details as any;
      const userId = details?.user_id;
      if (!userId || userId === '00000000-0000-0000-0000-000000000000') {
        return null;
      }
      return usersMap.get(userId) || null;
    })()
  }));

  if (process.env.NODE_ENV === 'development') {
    console.log('fetchEnhancedRecentEvents enriched result:', { ...eventsResult, data: enrichedData });
  }
  return { ...eventsResult, data: enrichedData };
}
