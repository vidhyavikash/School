import { GoogleGenAI } from "@google/genai";
import { AppData } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const analyzePerformance = async (data: AppData, classId: string, examId: string) => {
  try {
    const ai = getAIClient();
    
    // Prepare context
    const cls = data.classes.find(c => c.id === classId);
    const exam = data.exams.find(e => e.id === examId);
    const students = data.students.filter(s => s.classId === classId);
    
    const marksData = students.map(s => {
      const studentMarks = data.marks.filter(m => m.studentId === s.id && m.examId === examId);
      const subjects = studentMarks.map(m => {
        const sub = data.subjects.find(sub => sub.id === m.subjectId);
        return `${sub?.name}: ${m.score}`;
      }).join(', ');
      return `Student: ${s.name} (Roll: ${s.rollNo}) - Marks: [${subjects}]`;
    }).join('\n');

    const prompt = `
      Analyze the following exam results for Class: ${cls?.name}, Exam: ${exam?.name}.
      
      Data:
      ${marksData}

      Please provide a brief summary including:
      1. Top performers.
      2. Subjects where students struggled most.
      3. Suggested areas of improvement for the teacher.
      
      Keep it professional and concise.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return "Unable to generate AI analysis at this time. Please check your API key.";
  }
};
