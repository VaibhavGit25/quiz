import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardStyles.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [publishedQuizzes, setPublishedQuizzes] = useState([]);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [error, setError] = useState(null);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    if (!user.email) {
      setError('User not found!');
      return;
    }
  
    // Retrieve published quizzes from storage
    const allQuizzes = JSON.parse(localStorage.getItem('teacherQuizzes')) || {};
    setPublishedQuizzes(Object.values(allQuizzes).flat().filter(q => q.published));
  
    // Load only results for the logged-in student (filtering by email)
    const allResults = JSON.parse(localStorage.getItem('quizResults')) || {};
    setCompletedQuizzes(allResults[user.email] || []);
    
    setStudentName(user.name || 'Student'); // Preserve name display
  }, []);

  const startQuiz = (quiz) => {
    navigate('/quiz', { state: { quiz } });
  };

  const getAttempt = (quizId) => {
    return completedQuizzes.find(q => q.quizId === quizId);
  };

  const handleLogout = () => {
    localStorage.removeItem('user'); 

  
    
    // Prevent Back Navigation
    navigate('/', { replace: true });
  
    // Add additional safeguard to clear history
    setTimeout(() => {
      window.location.replace('/');
    }, 0);
  };
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome, {studentName}</h1>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>

        <div className="quizzes-section">
          <h2 className="dashboard-subtitle">Available Quizzes</h2>
          {publishedQuizzes.length === 0 ? (
            <p className="no-quizzes">No quizzes available yet</p>
          ) : (
            <div className="quiz-list">
              {publishedQuizzes.map(quiz => {
                const attempt = getAttempt(quiz.id);
                return (
                  <div key={quiz.id} className="quiz-item">
                    <div className="quiz-info">
                      <h3>{quiz.title}</h3>
                      <p>{quiz.topic} | {quiz.questionCount} Qs | {quiz.timeLimit} mins</p>
                      <p>Published: {new Date(quiz.publishedAt).toLocaleString()}</p>
                      {attempt && (
                        <p className="attempt-info">
                          Your score: {attempt.score}/{attempt.total} ({Math.round((attempt.score/attempt.total)*100)}%)
                        </p>
                      )}
                    </div>
                    {!attempt && (
                      <button
                        className="dashboard-button start-button"
                        onClick={() => startQuiz(quiz)}
                      >
                        Start Quiz
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {completedQuizzes.length > 0 && (
          <div className="quizzes-section">
            <h2 className="dashboard-subtitle">Your Completed Quizzes</h2>
            <div className="quiz-list">
              {completedQuizzes.map((quiz, i) => (
                <div key={i} className="quiz-item completed">
                  <h3>{quiz.quizTitle}</h3>
                  <p>Score: {quiz.score}/{quiz.total} ({Math.round((quiz.score/quiz.total)*100)}%)</p>
                  <p>Completed: {new Date(quiz.completedAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;