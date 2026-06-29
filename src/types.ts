export type ImportanceType = 'low' | 'medium' | 'high';
export type MeetingStyleType = 'blank' | 'lined' | 'cornell' | 'template';

export interface User {
  name: string;
  email: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  importance: ImportanceType;
  style: MeetingStyleType;
  notes: string;
  createdAt: string;
}

export type TaskPriorityType = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatusType = 'not_started' | 'in_progress' | 'completed';

export interface CustomProperty {
  key: string;
  value: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  priority: TaskPriorityType;
  tags: string[];
  status: TaskStatusType;
  customProperties: CustomProperty[];
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  checkedDays: number[]; // Array of checked days (1 to 31)
}

export type SectionType = 'notes' | 'checklist' | 'table' | 'dates' | 'trackers';

export interface CustomSection {
  id: string;
  title: string;
  type: SectionType;
  content: string;
}

export interface CustomPlanner {
  id: string;
  name: string;
  sections: CustomSection[];
  createdAt: string;
}

export interface Alarm {
  id: string;
  label: string;
  time: string; // HH:MM
  prepDuration: 2 | 5; // minutes
  repeat: 'once' | 'weekdays' | 'every_day';
  active: boolean;
}

export interface MatrixTask {
  id: string;
  name: string;
  quadrant: 'q1' | 'q2' | 'q3' | 'q4';
}
