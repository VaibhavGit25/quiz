import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './QuizTaker.css';

export default function QuizTaker() {
  const location = useLocation();
  const quiz = location.state?.quiz;
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (!quiz) {
    return <div>No quiz selected</div>;
  }

  return (
    <div className="quiz-taker-container">
      <div className="dashboard-card">
        <h1 className="dashboard-title">{quiz.title}</h1>
        
        <div className="quiz-questions">
          {quiz.questions.map((q, index) => (
            <div key={index} className="quiz-item">
              <h3>Question {index + 1}: {q.question}</h3>
              
              {q.type === 'multiple-choice' ? (
                <div className="options">
                  {q.options.map((option, i) => (
                    <label key={i} className="option">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        checked={answers[index] === option}
                        onChange={() => handleAnswerChange(index, option)}
                        disabled={submitted}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  className="dashboard-input"
                  value={answers[index] || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  disabled={submitted}
                />
              )}

              {submitted && (
                <div className="answer-feedback">
                  <p><strong>Correct Answer:</strong> {q.answer}</p>
                  {answers[index] === q.answer ? (
                    <p className="correct">✓ Correct!</p>
                  ) : (
                    <p className="incorrect">✗ Incorrect</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {!submitted ? (
          <button className="dashboard-button" onClick={handleSubmit}>
            Submit Quiz
          </button>
        ) : (
          <div className="quiz-results">
            <h3>Quiz Results</h3>
            <p>Score: {calculateScore(answers, quiz.questions)}/{quiz.questions.length}</p>
            <button 
              className="dashboard-button"
              onClick={() => navigate('/student')}
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function calculateScore(answers, questions) {
  return questions.reduce((score, q, i) => {
    return score + (answers[i] === q.answer ? 1 : 0);
  }, 0);
}