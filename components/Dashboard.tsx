import React from 'react';
import { AppData } from '../types';
import { Users, BookOpen, GraduationCap, ClipboardList } from 'lucide-react';

interface DashboardProps {
  data: AppData;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const stats = [
    { title: 'Total Students', value: data.students.length, icon: <Users size={24} />, color: 'bg-blue-500' },
    { title: 'Classes', value: data.classes.length, icon: <BookOpen size={24} />, color: 'bg-green-500' },
    { title: 'Subjects', value: data.subjects.length, icon: <GraduationCap size={24} />, color: 'bg-purple-500' },
    { title: 'Exams Conducted', value: data.exams.length, icon: <ClipboardList size={24} />, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
            <div className={`p-3 rounded-full ${stat.color} text-white`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Quick Guide</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Start by adding <strong>Classes</strong> and <strong>Subjects</strong>.</li>
          <li>Add <strong>Students</strong> and assign them to classes.</li>
          <li>Create an <strong>Exam</strong> for a specific class.</li>
          <li>Go to <strong>Marks Entry</strong> to input scores.</li>
          <li>Use <strong>Reports</strong> to print markledgers and student lists.</li>
          <li>Data is automatically saved to local storage (simulating a Google Sheet).</li>
        </ul>
      </div>
    </div>
  );
};