import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './QuizStyles.css';

const StudentQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quiz } = location.state || {};
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(quiz?.timeLimit * 60 || 0);
  const [studentName, setStudentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warning, setWarning] = useState('');

  // Redirect if no quiz is selected
  useEffect(() => {
    if (!quiz) {
      navigate('/student', { state: { error: 'No quiz selected' } });
    }
  }, [quiz, navigate]);

  // Initialize student name and timer
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    setStudentName(user.name || 'Anonymous Student');

    if (timeLeft <= 0 && !score) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!score) handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [score]);

  const handleAnswerSelect = useCallback((questionIndex, answer) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Check if all required questions are answered
    const unansweredQuestions = quiz.questions.filter((_, index) => {
      return quiz.questions[index].required && answers[index] === undefined;
    });

    if (unansweredQuestions.length > 0 && !window.confirm(
      `You haven't answered ${unansweredQuestions.length} required question(s). Submit anyway?`
    )) {
      setIsSubmitting(false);
      const firstUnanswered = quiz.questions.findIndex((_, index) => 
        quiz.questions[index].required && answers[index] === undefined
      );
      setCurrentQuestion(firstUnanswered);
      setWarning('Please answer all required questions');
      return;
    }

    // Calculate score
    let correct = 0;
    quiz.questions.forEach((q, index) => {
      let userAnswer = answers[index]?.trim().toLowerCase();
      let correctAnswer = q.answer ? q.answer.trim().toLowerCase() : '';

      if (q.type === 'short-answer' && correctAnswer) {
        userAnswer = userAnswer?.split(' ')[0] || ''; // Safe split
        correctAnswer = correctAnswer.split(' ')[0];
      }

      if (userAnswer === correctAnswer) correct++;
    });

    const percentage = Math.round((correct / quiz.questions.length) * 100);

    // Retrieve current user
    const user = JSON.parse(localStorage.getItem('user')) || {};
    if (!user.email) {
      setWarning('User not found!');
      setIsSubmitting(false);
      return;
    }

    // Create result object specific to the logged-in student
    const result = {
      quizId: quiz.id,
      quizTitle: quiz.title,
      studentEmail: user.email, // Associate results with student's email
      score: correct,
      total: quiz.questions.length,
      percentage,
      completedAt: new Date().toISOString(),
      answers: quiz.questions.map((q, i) => ({
        question: q.question,
        studentAnswer: answers[i] || 'No answer provided',
        correctAnswer: q.answer,
        isCorrect: answers[i] === q.answer
      }))
    };

    // Store results per student
    try {
      const allResults = JSON.parse(localStorage.getItem('quizResults')) || {};
      allResults[user.email] = [...(allResults[user.email] || []), result];

      localStorage.setItem('quizResults', JSON.stringify(allResults));

      setScore({ correct, total: quiz.questions.length, percentage, results: result.answers });
    } catch (error) {
      console.error('Failed to save results:', error);
      setWarning('Failed to save your results. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, isSubmitting, quiz]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  if (!quiz) return <div className="quiz-container">Redirecting...</div>;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1>{quiz.title}</h1>
        <div className="quiz-meta">
          <span>Topic: {quiz.topic}</span>
          <span>Time Left: {formatTime(timeLeft)}</span>
          {quiz.questions.length > 1 && (
            <span>Questions: {quiz.questions.length}</span>
          )}
        </div>
      </div>

      {warning && <div className="warning-message">{warning}</div>}

      {score ? (
        <div className="quiz-results">
          <h2>Quiz Completed!</h2>
          <div className={`score-display ${score.percentage >= 70 ? 'good-score' : score.percentage >= 50 ? 'average-score' : 'poor-score'}`}>
            You scored {score.correct} out of {score.total} ({score.percentage}%)
          </div>
          
          <button className="dashboard-button" onClick={() => navigate('/student')}>
            Back to Dashboard
          </button>
        </div>
      ) : (
        <div className="question-container">
          <div className="question-progress">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </div>

          <div className="question-card">
            <h3>{quiz.questions[currentQuestion].question}</h3>
            
            {quiz.questions[currentQuestion].type === 'multiple-choice' ? (
              <div className="options-list">
                {quiz.questions[currentQuestion].options.map((option, i) => (
                  <div key={i} className={`option ${answers[currentQuestion] === option ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(currentQuestion, option)}>
                    {option}
                  </div>
                ))}
              </div>
            ) : (
              <textarea
                className="answer-input"
                value={answers[currentQuestion] || ''}
                onChange={(e) => handleAnswerSelect(currentQuestion, e.target.value)}
                placeholder="Type your answer here..."
                rows={5}
              />
            )}
          </div>

          <div className="quiz-navigation">
            {currentQuestion > 0 && (
              <button className="nav-button prev-button" onClick={() => setCurrentQuestion(prev => prev - 1)}>Previous</button>
            )}
            {currentQuestion < quiz.questions.length - 1 ? (
              <button className="nav-button next-button" onClick={() => setCurrentQuestion(prev => prev + 1)}>Next</button>
            ) : (
              <button className="nav-button submit-button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuiz;