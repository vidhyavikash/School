import { AppData } from '../types';

const STORAGE_KEY = 'edutrack_data_v1';

const INITIAL_DATA: AppData = {
  classes: [
    { id: 'c1', name: 'Class 10-A' },
    { id: 'c2', name: 'Class 9-B' },
  ],
  students: [
    { id: 's1', name: 'John Doe', rollNo: '101', classId: 'c1' },
    { id: 's2', name: 'Jane Smith', rollNo: '102', classId: 'c1' },
    { id: 's3', name: 'Alice Johnson', rollNo: '103', classId: 'c1' },
    { id: 's4', name: 'Bob Brown', rollNo: '201', classId: 'c2' },
  ],
  subjects: [
    { id: 'sub1', name: 'Mathematics', fullMarks: 100, passMarks: 40 },
    { id: 'sub2', name: 'Science', fullMarks: 100, passMarks: 40 },
    { id: 'sub3', name: 'English', fullMarks: 50, passMarks: 20 },
  ],
  exams: [
    { id: 'e1', name: 'Mid-Term 2024', date: '2024-06-15', classId: 'c1' },
  ],
  marks: [
    { id: 'm1', examId: 'e1', studentId: 's1', subjectId: 'sub1', score: 85 },
    { id: 'm2', examId: 'e1', studentId: 's1', subjectId: 'sub2', score: 78 },
    { id: 'm3', examId: 'e1', studentId: 's2', subjectId: 'sub1', score: 92 },
    { id: 'm4', examId: 'e1', studentId: 's2', subjectId: 'sub2', score: 88 },
  ],
};

export const loadData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse stored data", e);
    }
  }
  return INITIAL_DATA;
};

export const saveData = (data: AppData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const exportToCSV = (data: AppData, type: keyof AppData) => {
  const items = data[type];
  if (!items || items.length === 0) return '';

  const headers = Object.keys(items[0]).join(',');
  const rows = items.map(item => Object.values(item).join(','));
  return [headers, ...rows].join('\n');
};
