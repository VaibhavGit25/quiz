import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './DashboardStyles.css';

const QuizResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quiz } = location.state || {};
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!quiz) {
      navigate('/teacher');
      return;
    }
    
    const allResults = JSON.parse(localStorage.getItem('quizResults')) || [];
    setResults(allResults.filter(result => result.quizId === quiz.id));
  }, [quiz, navigate]);

  const calculateAverage = () => {
    if (results.length === 0) return 0;
    return Math.round(
      results.reduce((sum, r) => sum + (r.score / r.total * 100), 0) / results.length
    );
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Results: {quiz?.title}</h1>
          <button onClick={() => navigate('/teacher')} className="logout-button">
            Back to Dashboard
          </button>
        </div>

        <div className="results-summary">
          <p>Total Attempts: {results.length}</p>
          <p>Average Score: {calculateAverage()}%</p>
        </div>

        <div className="results-list">
          <h2 className="dashboard-subtitle">Student Attempts</h2>
          {results.length === 0 ? (
            <p className="no-results">No attempts yet</p>
          ) : (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, i) => (
                  <tr key={i}>
                    <td>{result.studentName}</td>
                    <td>{new Date(result.completedAt).toLocaleString()}</td>
                    <td>{result.score}/{result.total}</td>
                    <td>{Math.round((result.score/result.total)*100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResults;