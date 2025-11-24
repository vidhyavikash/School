import React, { useState } from 'react';
import { AppData } from '../types';
import { Button } from './Button';
import { Select } from './Input';
import { Printer, Sparkles } from 'lucide-react';
import { analyzePerformance } from '../services/geminiService';

interface ReportsProps {
  data: AppData;
}

export const Reports: React.FC<ReportsProps> = ({ data }) => {
  const [reportType, setReportType] = useState<'student_list' | 'markledger'>('student_list');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  const students = data.students.filter(s => s.classId === selectedClassId);
  
  const handlePrint = () => {
    window.print();
  };

  const handleAIAnalysis = async () => {
    if (!selectedClassId || !selectedExamId) return;
    setLoadingAi(true);
    const result = await analyzePerformance(data, selectedClassId, selectedExamId);
    setAiAnalysis(result);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-6">
      <div className="no-print bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-lg font-semibold">Generate Reports</h2>
        <div className="flex gap-4 flex-wrap">
          <Button variant={reportType === 'student_list' ? 'primary' : 'secondary'} onClick={() => setReportType('student_list')}>Student List</Button>
          <Button variant={reportType === 'markledger' ? 'primary' : 'secondary'} onClick={() => setReportType('markledger')}>Markledger</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Class" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
             <option value="">-- Select Class --</option>
             {data.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          
          {reportType === 'markledger' && (
             <Select label="Exam" value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}>
                <option value="">-- Select Exam --</option>
                {data.exams.filter(e => e.classId === selectedClassId).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
             </Select>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-2">
            <div className="space-x-2">
                <Button onClick={handlePrint} disabled={!selectedClassId} icon={<Printer size={16} />}>Print Report</Button>
                {reportType === 'markledger' && selectedExamId && (
                     <Button 
                        onClick={handleAIAnalysis} 
                        disabled={loadingAi} 
                        variant="secondary"
                        icon={<Sparkles size={16} className={loadingAi ? "animate-spin" : "text-purple-600"} />}
                    >
                        {loadingAi ? 'Analyzing...' : 'AI Insights'}
                    </Button>
                )}
            </div>
        </div>
      </div>

      {/* AI Analysis Result Block */}
      {aiAnalysis && (
        <div className="no-print bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="font-bold text-purple-900 flex items-center gap-2">
                <Sparkles size={18} /> AI Performance Analysis
            </h3>
            <div className="mt-2 text-purple-800 whitespace-pre-wrap text-sm leading-relaxed">
                {aiAnalysis}
            </div>
            <Button size="sm" variant="ghost" className="mt-2 text-purple-700 hover:bg-purple-100" onClick={() => setAiAnalysis('')}>Close Analysis</Button>
        </div>
      )}

      {/* Printable Area */}
      <div className="bg-white p-8 shadow-sm min-h-[500px] print:shadow-none print:p-0">
        {!selectedClassId ? (
            <p className="text-gray-500 text-center py-10">Select a class to view report</p>
        ) : (
            <div>
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold uppercase tracking-wide">School Name Here</h1>
                    <p className="text-sm text-gray-500">Address of the school</p>
                    <h2 className="text-xl font-semibold mt-4 border-b-2 border-gray-800 inline-block pb-1">
                        {reportType === 'student_list' ? 'Student List' : 'Mark Ledger'}
                    </h2>
                    <div className="mt-2 flex justify-center gap-6 text-sm font-medium">
                        <span>Class: {data.classes.find(c => c.id === selectedClassId)?.name}</span>
                        {reportType === 'markledger' && (
                             <span>Exam: {data.exams.find(e => e.id === selectedExamId)?.name || 'N/A'}</span>
                        )}
                        <span>Date: {new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                {reportType === 'student_list' && (
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 p-2 text-left w-16">Roll</th>
                                <th className="border border-gray-300 p-2 text-left">Name</th>
                                <th className="border border-gray-300 p-2 text-left">ID</th>
                                <th className="border border-gray-300 p-2 text-left w-32">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.sort((a,b) => a.rollNo.localeCompare(b.rollNo)).map(s => (
                                <tr key={s.id}>
                                    <td className="border border-gray-300 p-2">{s.rollNo}</td>
                                    <td className="border border-gray-300 p-2 font-medium">{s.name}</td>
                                    <td className="border border-gray-300 p-2 text-gray-500">{s.id.slice(0,6)}</td>
                                    <td className="border border-gray-300 p-2"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {reportType === 'markledger' && selectedExamId && (
                     <table className="w-full border-collapse border border-gray-300 text-sm text-center">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 p-2 text-left w-12">Roll</th>
                                <th className="border border-gray-300 p-2 text-left w-48">Name</th>
                                {data.subjects.map(sub => (
                                    <th key={sub.id} className="border border-gray-300 p-2">
                                        {sub.name} <br/> <span className="text-xs font-normal">({sub.fullMarks})</span>
                                    </th>
                                ))}
                                <th className="border border-gray-300 p-2 bg-gray-200">Total</th>
                                <th className="border border-gray-300 p-2 bg-gray-200">Avg</th>
                            </tr>
                        </thead>
                        <tbody>
                             {students.sort((a,b) => a.rollNo.localeCompare(b.rollNo)).map(s => {
                                 let total = 0;
                                 let count = 0;
                                 return (
                                    <tr key={s.id}>
                                        <td className="border border-gray-300 p-2 text-left">{s.rollNo}</td>
                                        <td className="border border-gray-300 p-2 text-left font-medium">{s.name}</td>
                                        {data.subjects.map(sub => {
                                            const mark = data.marks.find(m => m.studentId === s.id && m.examId === selectedExamId && m.subjectId === sub.id);
                                            const score = mark ? mark.score : 0;
                                            total += score;
                                            count++;
                                            const isFail = score < sub.passMarks;
                                            return (
                                                <td key={sub.id} className={`border border-gray-300 p-2 ${isFail ? 'text-red-600 font-bold' : ''}`}>
                                                    {mark ? mark.score : '-'}
                                                </td>
                                            )
                                        })}
                                        <td className="border border-gray-300 p-2 font-bold">{total}</td>
                                        <td className="border border-gray-300 p-2 font-bold">{(count > 0 ? (total/count).toFixed(1) : '0')}</td>
                                    </tr>
                                 )
                             })}
                        </tbody>
                     </table>
                )}
            </div>
        )}
      </div>
    </div>
  );
};