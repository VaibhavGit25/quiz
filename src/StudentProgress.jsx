import { useState, useEffect } from 'react';
import './DashboardStyles.css';

export default function StudentProgress() {
  const [progressData, setProgressData] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    // Mock data - in real app you would fetch from an API
    setProgressData([
      {
        student: "student1@test.com",
        quizzes: [
          { id: 1, title: "Photosynthesis Quiz", score: "8/10", completed: "2023-11-15" },
          { id: 2, title: "Cell Biology Quiz", score: "7/10", completed: "2023-11-20" }
        ]
      },
      // ...more students
    ]);
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1 className="dashboard-title">Student Progress</h1>
        
        <div className="progress-filters">
          <select 
            className="dashboard-input"
            onChange={(e) => setSelectedQuiz(e.target.value)}
          >
            <option value="">All Quizzes</option>
            <option value="1">Photosynthesis Quiz</option>
            <option value="2">Cell Biology Quiz</option>
          </select>
        </div>

        <div className="progress-list">
          {progressData.map((student, index) => (
            <div key={index} className="quiz-item">
              <h3>{student.student}</h3>
              <div className="student-quizzes">
                {student.quizzes
                  .filter(q => !selectedQuiz || q.id == selectedQuiz)
                  .map((quiz, qIndex) => (
                    <div key={qIndex} className="quiz-result">
                      <p><strong>{quiz.title}</strong>: {quiz.score}</p>
                      <p>Completed: {quiz.completed}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}