// Define ProblemAsset interface with Record compatibility
export interface ProblemAsset {
  uuid: string;
  id: string;
  identifier: string;
  radio?: string;
  line_number?: number;
  type: string;
  status: string;
  solution_id?: number;
  [key: string]: unknown; // Index signature for Record compatibility
}