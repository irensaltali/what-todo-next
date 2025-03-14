export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  list: string;
  task_count: number;
  progress: number;
  status: 'ongoing' | 'inprogress' | 'canceled' | 'completed';
  start_time: string;
  deadlineHours?: number; // Optional, in hours (can be hours or days converted to hours)
  value_impact?: number; // Optional, 1-100
  difficulty?: number; // Optional, 1-10
  tags: string[];
  alert_enabled: boolean;
  created_at: string;
  updated_at: string;
}
