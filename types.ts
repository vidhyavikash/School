export interface ClassEntity {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  classId: string;
}

export interface Subject {
  id: string;
  name: string;
  fullMarks: number;
  passMarks: number;
}

export interface Exam {
  id: string;
  name: string;
  date: string;
  classId: string; // Exams are often class-specific
}

export interface Mark {
  id: string;
  examId: string;
  studentId: string;
  subjectId: string;
  score: number;
}

export interface AppData {
  classes: ClassEntity[];
  students: Student[];
  subjects: Subject[];
  exams: Exam[];
  marks: Mark[];
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  STUDENTS = 'STUDENTS',
  CLASSES = 'CLASSES',
  SUBJECTS = 'SUBJECTS',
  EXAMS = 'EXAMS',
  MARKS_ENTRY = 'MARKS_ENTRY',
  REPORTS = 'REPORTS',
}
