
export interface DashboardStatsResponse {
  totalAssets: number;
  activeClients: number;
  assetsWithIssues: number;
  recentAssets: RecentAsset[];
  recentEvents: RecentEvent[];
  pieChartData: PieChartDataPoint[];
  detailedStatusData: DetailedStatusDataPoint[];
}

export interface RecentAsset {
  id: string;
  name: string;
  type: string;
  status: string;
  solution: string;
}

export interface RecentEvent {
  id: number;
  type: string;
  description: string;
  time: string;
  asset_id?: string;
  asset_name?: string;
  user_email?: string;
}

export interface PieChartDataPoint {
  status: string;
  total: number;
}

export interface DetailedStatusDataPoint {
  type: string;
  status: string;
  total: number;
}

export interface StatusSummaryItem {
  status: string;
  count: number;
  statusId: number;
}

export interface AssetQueryResult {
  uuid: string;
  model: string | null;
  serial_number: string | null;
  line_number: number | null;
  iccid: string | null;
  radio: string | null;
  solution_id: number;
  status_id: number;
  asset_solutions?: { id: number; solution: string } | null;
  asset_status?: { id: number; status: string } | null;
}

export interface EventQueryResult {
  id: number;
  event: string;
  date: string;
  details: Record<string, unknown>;
  status_before_id?: number;
  status_after_id?: number;
  user_email?: string;
}

export interface QueryErrorResult {
  error: Error | null;
  data: any;
  count?: number;
}
