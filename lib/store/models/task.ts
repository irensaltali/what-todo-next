export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  task_count: number;
  progress: number;
  status: 'ongoing' | 'inprocess' | 'canceled' | 'completed';
  start_time: string;
  tags: string[];
  alert_enabled: boolean;
  created_at: string;
  updated_at: string;
}