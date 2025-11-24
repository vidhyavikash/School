import React, { useState } from 'react';
import { AppData, Mark } from '../types';
import { Button } from './Button';
import { Select } from './Input';
import { Save } from 'lucide-react';

interface MarksEntryProps {
  data: AppData;
  onSaveMarks: (marks: Mark[]) => void;
}

export const MarksEntry: React.FC<MarksEntryProps> = ({ data, onSaveMarks }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [tempMarks, setTempMarks] = useState<Record<string, number>>({});

  const filteredExams = data.exams.filter(e => e.classId === selectedClassId);
  const filteredStudents = data.students.filter(s => s.classId === selectedClassId);
  
  const handleScoreChange = (studentId: string, score: string) => {
    const val = parseFloat(score);
    if (!isNaN(val)) {
      setTempMarks(prev => ({ ...prev, [studentId]: val }));
    }
  };

  const loadExistingMarks = () => {
    if (!selectedExamId || !selectedSubjectId) return;
    const existing: Record<string, number> = {};
    filteredStudents.forEach(s => {
      const mark = data.marks.find(m => m.studentId === s.id && m.examId === selectedExamId && m.subjectId === selectedSubjectId);
      if (mark) {
        existing[s.id] = mark.score;
      }
    });
    setTempMarks(existing);
  };

  // Load marks when selection changes
  React.useEffect(() => {
    loadExistingMarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExamId, selectedSubjectId, selectedClassId]);

  const handleSave = () => {
    if (!selectedExamId || !selectedSubjectId) return;
    
    const newMarks: Mark[] = [];
    Object.entries(tempMarks).forEach(([studentId, score]) => {
        // Find existing to keep ID or create new
        const existingMark = data.marks.find(m => m.studentId === studentId && m.examId === selectedExamId && m.subjectId === selectedSubjectId);
        newMarks.push({
            id: existingMark ? existingMark.id : crypto.randomUUID(),
            examId: selectedExamId,
            subjectId: selectedSubjectId,
            studentId,
            score: score as number
        });
    });
    onSaveMarks(newMarks);
    alert('Marks saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm">
        <Select 
          label="Select Class" 
          value={selectedClassId} 
          onChange={(e) => { setSelectedClassId(e.target.value); setSelectedExamId(''); }}
        >
          <option value="">-- Choose Class --</option>
          {data.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>

        <Select 
          label="Select Exam" 
          value={selectedExamId} 
          onChange={(e) => setSelectedExamId(e.target.value)}
          disabled={!selectedClassId}
        >
          <option value="">-- Choose Exam --</option>
          {filteredExams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </Select>

        <Select 
          label="Select Subject" 
          value={selectedSubjectId} 
          onChange={(e) => setSelectedSubjectId(e.target.value)}
        >
           <option value="">-- Choose Subject --</option>
           {data.subjects.map(s => <option key={s.id} value={s.id}>{s.name} (Max: {s.fullMarks})</option>)}
        </Select>
      </div>

      {selectedClassId && selectedExamId && selectedSubjectId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
             <h3 className="font-semibold text-lg">Enter Marks</h3>
             <Button onClick={handleSave} icon={<Save size={16} />}>Save Marks</Button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">No students found in this class.</td></tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.rollNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="number" 
                        min="0" 
                        max="100"
                        className="border border-gray-300 rounded px-2 py-1 w-24 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={tempMarks[student.id] ?? ''}
                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                        placeholder="0"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};