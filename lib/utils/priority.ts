import { Task } from '../store/models/task';


// Function to calculate priority score
function calculatePriorityScore(
    task: Task,
    w_v: number = 100,  // Weight for value
    w_d: number = 1,    // Weight for deadline (per hour)
    w_t: number = 0.5   // Weight for difficulty
): number {
    // Handle Deadline (D)
    let deadlineHours = task.deadlineHours ?? 8760; // Default to 1 year (365 days * 24 hours)
    if (deadlineHours > 8760) deadlineHours = 8760; // Cap at 1 year
    deadlineHours = Math.max(deadlineHours, 0.1);   // Prevent division by zero

    // Handle Value (V)
    let value = task.value_impact ?? 50; // Default to 50
    value = Math.max(1, Math.min(100, value)); // Clamp to 1-100

    // Handle Difficulty (T)
    let difficulty = task.difficulty ?? 5; // Default to 5
    difficulty = Math.max(1, Math.min(10, difficulty)); // Clamp to 1-10

    // Calculate Priority Score
    const score = (value * w_v) / (deadlineHours * w_d + difficulty * w_t);
    return score;
}

export { calculatePriorityScore };
