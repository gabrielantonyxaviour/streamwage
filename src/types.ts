// On-chain stream shape used by presentational components (WorkerCard).
export interface WorkerStream {
  id: number;
  name: string;
  role?: string;
  wallet: string;
  monthlyCusd: number;
  accruedCusd: number;
  paused: boolean;
  mine: boolean;
}
