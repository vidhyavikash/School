import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap, 
  ClipboardList, 
  FileText, 
  Menu, 
  X,
  Plus,
  Trash2,
  Download
} from 'lucide-react';
import { AppData, ViewState, Student, ClassEntity, Subject, Exam, Mark } from './types';
import { loadData, saveData, exportToCSV } from './services/storageService';
import { Button } from './components/Button';
import { Input, Select } from './components/Input';
import { Dashboard } from './components/Dashboard';
import { MarksEntry } from './components/MarksEntry';
import { Reports } from './components/Reports';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(loadData());
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const updateData = (key: keyof AppData, newData: any[]) => {
    setData(prev => ({ ...prev, [key]: newData }));
  };

  const NavItem = ({ view, icon, label }: { view: ViewState; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => { setCurrentView(view); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${currentView === view ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  // Generic CRUD Handlers
  const addStudent = (student: Student) => updateData('students', [...data.students, student]);
  const deleteStudent = (id: string) => updateData('students', data.students.filter(s => s.id !== id));
  
  const addClass = (cls: ClassEntity) => updateData('classes', [...data.classes, cls]);
  const deleteClass = (id: string) => updateData('classes', data.classes.filter(c => c.id !== id));

  const addSubject = (sub: Subject) => updateData('subjects', [...data.subjects, sub]);
  const deleteSubject = (id: string) => updateData('subjects', data.subjects.filter(s => s.id !== id));

  const addExam = (exam: Exam) => updateData('exams', [...data.exams, exam]);
  const deleteExam = (id: string) => updateData('exams', data.exams.filter(e => e.id !== id));

  const saveMarks = (newMarks: Mark[]) => {
    // Merge marks
    const updatedMarks = [...data.marks];
    newMarks.forEach(nm => {
        const idx = updatedMarks.findIndex(m => m.studentId === nm.studentId && m.examId === nm.examId && m.subjectId === nm.subjectId);
        if (idx >= 0) updatedMarks[idx] = nm;
        else updatedMarks.push(nm);
    });
    updateData('marks', updatedMarks);
  };
  
  const handleExport = () => {
      const csv = exportToCSV(data, 'marks');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'edutrack_marks.csv';
      a.click();
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 no-print`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-wider text-indigo-400">EduTrack</h1>
            <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}><X /></button>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavItem view={ViewState.DASHBOARD} icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <NavItem view={ViewState.CLASSES} icon={<BookOpen size={20} />} label="Classes" />
            <NavItem view={ViewState.SUBJECTS} icon={<GraduationCap size={20} />} label="Subjects" />
            <NavItem view={ViewState.STUDENTS} icon={<Users size={20} />} label="Students" />
            <NavItem view={ViewState.EXAMS} icon={<ClipboardList size={20} />} label="Exams" />
            <NavItem view={ViewState.MARKS_ENTRY} icon={<FileText size={20} />} label="Marks Entry" />
            <NavItem view={ViewState.REPORTS} icon={<FileText size={20} />} label="Reports & Print" />
          </nav>
          <div className="p-4 border-t border-gray-800">
             <button onClick={handleExport} className="w-full flex items-center justify-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors">
                <Download size={16} />
                <span>Export to CSV</span>
             </button>
             <p className="text-xs text-center text-gray-600 mt-2">Data auto-saved locally</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10 p-4 flex items-center justify-between md:justify-end no-print">
          <button className="md:hidden text-gray-600" onClick={() => setIsSidebarOpen(true)}><Menu /></button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Academic Year 2024-2025</span>
            <div className="h-8 w-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">A</div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 scroll-smooth">
          {currentView === ViewState.DASHBOARD && <Dashboard data={data} />}
          
          {currentView === ViewState.CLASSES && (
            <SimpleList 
              title="Manage Classes" 
              items={data.classes} 
              onAdd={(name) => addClass({ id: crypto.randomUUID(), name })} 
              onDelete={deleteClass} 
              placeholder="e.g. Class 10-A"
            />
          )}

          {currentView === ViewState.SUBJECTS && (
             <SubjectManager subjects={data.subjects} onAdd={addSubject} onDelete={deleteSubject} />
          )}

          {currentView === ViewState.STUDENTS && (
             <StudentManager students={data.students} classes={data.classes} onAdd={addStudent} onDelete={deleteStudent} />
          )}
          
          {currentView === ViewState.EXAMS && (
             <ExamManager exams={data.exams} classes={data.classes} onAdd={addExam} onDelete={deleteExam} />
          )}

          {currentView === ViewState.MARKS_ENTRY && (
            <MarksEntry data={data} onSaveMarks={saveMarks} />
          )}

          {currentView === ViewState.REPORTS && (
            <Reports data={data} />
          )}
        </main>
      </div>
    </div>
  );
};

// --- Sub-components (kept in App.tsx for simplicity of the prompt's request, but typically separated) ---

const SimpleList = ({ title, items, onAdd, onDelete, placeholder }: any) => {
  const [val, setVal] = useState('');
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm flex gap-4">
        <Input placeholder={placeholder} value={val} onChange={e => setVal(e.target.value)} />
        <Button onClick={() => { if(val) { onAdd(val); setVal(''); } }} icon={<Plus size={16}/>}>Add</Button>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
        {items.map((item: any) => (
          <div key={item.id} className="p-4 flex justify-between items-center">
            <span className="font-medium text-gray-700">{item.name}</span>
            <button onClick={() => onDelete(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
          </div>
        ))}
        {items.length === 0 && <p className="p-4 text-gray-500 text-center">No items found.</p>}
      </div>
    </div>
  );
}

const SubjectManager = ({ subjects, onAdd, onDelete }: any) => {
    const [name, setName] = useState('');
    const [fullMarks, setFullMarks] = useState('100');
    const [passMarks, setPassMarks] = useState('40');

    const handleAdd = () => {
        if(name) {
            onAdd({ id: crypto.randomUUID(), name, fullMarks: Number(fullMarks), passMarks: Number(passMarks) });
            setName('');
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Manage Subjects</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2"><Input label="Subject Name" value={name} onChange={e => setName(e.target.value)} /></div>
                <Input label="Full Marks" type="number" value={fullMarks} onChange={e => setFullMarks(e.target.value)} />
                <Input label="Pass Marks" type="number" value={passMarks} onChange={e => setPassMarks(e.target.value)} />
                <div className="md:col-span-4 flex justify-end"><Button onClick={handleAdd} icon={<Plus size={16}/>}>Add Subject</Button></div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks (Full/Pass)</th><th className="px-6 py-3 text-right">Action</th></tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {subjects.map((s: any) => (
                            <tr key={s.id}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{s.fullMarks} / {s.passMarks}</td>
                                <td className="px-6 py-4 text-right"><button onClick={() => onDelete(s.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

const StudentManager = ({ students, classes, onAdd, onDelete }: any) => {
    const [name, setName] = useState('');
    const [roll, setRoll] = useState('');
    const [cls, setCls] = useState('');

    const handleAdd = () => {
        if(name && roll && cls) {
            onAdd({ id: crypto.randomUUID(), name, rollNo: roll, classId: cls });
            setName(''); setRoll('');
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Students Directory</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2"><Input label="Student Name" value={name} onChange={e => setName(e.target.value)} /></div>
                <Input label="Roll Number" value={roll} onChange={e => setRoll(e.target.value)} />
                <Select label="Class" value={cls} onChange={e => setCls(e.target.value)}>
                    <option value="">Select Class</option>
                    {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
                <div className="md:col-span-4 flex justify-end"><Button onClick={handleAdd} icon={<Plus size={16}/>}>Add Student</Button></div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th><th className="px-6 py-3 text-right">Action</th></tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {students.map((s: any) => (
                            <tr key={s.id}>
                                <td className="px-6 py-4 text-sm text-gray-500">{s.rollNo}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{classes.find((c:any) => c.id === s.classId)?.name || 'Unknown'}</td>
                                <td className="px-6 py-4 text-right"><button onClick={() => onDelete(s.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const ExamManager = ({ exams, classes, onAdd, onDelete }: any) => {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [cls, setCls] = useState('');

    const handleAdd = () => {
        if(name && date && cls) {
            onAdd({ id: crypto.randomUUID(), name, date, classId: cls });
            setName(''); setDate('');
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Exam Schedule</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <Input label="Exam Name" placeholder="e.g. Mid-Term" value={name} onChange={e => setName(e.target.value)} />
                <Select label="Class" value={cls} onChange={e => setCls(e.target.value)}>
                    <option value="">Select Class</option>
                    {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
                <Input type="date" label="Date" value={date} onChange={e => setDate(e.target.value)} />
                <div className="md:col-span-3 flex justify-end"><Button onClick={handleAdd} icon={<Plus size={16}/>}>Create Exam</Button></div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-6 py-3 text-right">Action</th></tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {exams.map((e: any) => (
                            <tr key={e.id}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{e.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{classes.find((c:any) => c.id === e.classId)?.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{e.date}</td>
                                <td className="px-6 py-4 text-right"><button onClick={() => onDelete(e.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default App;