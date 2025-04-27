import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './DashboardStyles.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [timeLimit, setTimeLimit] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [savedQuizzes, setSavedQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [model, setModel] = useState(null);
  const [quizResults, setQuizResults] = useState([]);

  useEffect(() => {
    const initializeGemini = async () => {
      try {
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
        if (!apiKey) throw new Error('Gemini API key not configured');

        const genAI = new GoogleGenerativeAI(apiKey);
        try {
          setModel(genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" }));
        } catch {
          setModel(genAI.getGenerativeModel({ model: "gemini-1.0-pro" }));
        }
      } catch (err) {
        setError('Failed to initialize AI service');
      }
    };

    initializeGemini();
    const saved = JSON.parse(localStorage.getItem('teacherQuizzes')) || [];
    setSavedQuizzes(saved);
    setQuizResults(JSON.parse(localStorage.getItem('quizResults')) || []);
  }, []);

  const generateQuiz = async () => {
    if (!model) {
      setError('AI model not ready');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      if (!topic.trim()) throw new Error('Please enter a quiz topic');
      if (questionCount < 1 || questionCount > 20) throw new Error('Please enter between 1-20 questions');

      const mcqCount = Math.floor(questionCount * 0.4);
      const saqCount = questionCount - mcqCount;

      const prompt = `Generate a ${questionCount}-question quiz about ${topic} at ${difficulty} difficulty level.
Include ${mcqCount} multiple choice and ${saqCount} short answer questions.
Ensure that short-answer responses are **one-word answers only**.
Format strictly as:

Q: [question text]
Options:
1) [option1]
2) [option2]
3) [option3]
4) [option4]
A: [correct answer only ,don"t add option or anything in front of corect ans]

Ensure options are listed one per line and maintain clarity for selection.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const generatedQuestions = parseQuizContent(text);
      if (generatedQuestions.length === 0) throw new Error('Failed to generate valid questions');

      setQuestions(generatedQuestions);
      setSuccess(`Generated ${generatedQuestions.length} questions!`);
    } catch (error) {
      setError(error.message || 'Failed to generate quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const parseQuizContent = (content) => {
    const questionBlocks = content.split('\n\n');
    return questionBlocks.map(block => {
      const questionMatch = block.match(/Q:\s*(.*?)\n/);
      const answerMatch = block.match(/A:\s*(.*)/);
      const optionsMatch = block.match(/Options:\s*((?:\d\)\s*.*(?:\n|$))+)/);
  
      if (!questionMatch || !answerMatch) return null;
  
      return {
        question: questionMatch[1],
        answer: answerMatch[1].trim(),
        type: optionsMatch ? 'multiple-choice' : 'short-answer',
        options: optionsMatch
          ? optionsMatch[1]
              .split(/\d\)\s*/) // Splits based on numbers (1), (2), (3), (4)
              .filter(opt => opt.trim().length > 0) // Removes empty strings
              .map(opt => opt.trim()) // Trims spaces
          : []
      };
    }).filter(Boolean);
  };
  const saveQuiz = () => {
    if (questions.length === 0) {
      setError('No questions to save');
      return;
    }

    const newQuiz = {
      id: Date.now(),
      title: `${topic} Quiz (${difficulty})`,
      topic,
      difficulty,
      questionCount,
      timeLimit,
      questions,
      createdAt: new Date().toISOString(),
      published: false
    };

    const updatedQuizzes = [...savedQuizzes, newQuiz];
    setSavedQuizzes(updatedQuizzes);
    localStorage.setItem('teacherQuizzes', JSON.stringify(updatedQuizzes));
    setSuccess('Quiz saved successfully!');
    resetForm();
  };

  const publishQuiz = (quizId) => {
    const updatedQuizzes = savedQuizzes.map(quiz => 
      quiz.id === quizId ? { ...quiz, published: true, publishedAt: new Date().toISOString() } : quiz
    );
    setSavedQuizzes(updatedQuizzes);
    localStorage.setItem('teacherQuizzes', JSON.stringify(updatedQuizzes));
    setSuccess('Quiz published!');
  };

  const deleteQuiz = (quizId) => {
    const updatedQuizzes = savedQuizzes.filter(quiz => quiz.id !== quizId);
    setSavedQuizzes(updatedQuizzes);
    localStorage.setItem('teacherQuizzes', JSON.stringify(updatedQuizzes));
    setSuccess('Quiz deleted!');
  };

  const resetForm = () => {
    setQuestions([]);
    setTopic('');
    setQuestionCount(5);
    setTimeLimit(10);
  };

  const getQuizResults = (quizId) => {
    return quizResults.filter(result => result.quizId === quizId);
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
          <h1 className="dashboard-title">Teacher Dashboard</h1>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="quiz-generator">
          <h2 className="dashboard-subtitle">Create New Quiz</h2>
          
          <input
            className="dashboard-input"
            type="text"
            placeholder="Topic (e.g., Photosynthesis)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isLoading}
          />

          <div className="input-group">
            <select
              className="dashboard-input"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              disabled={isLoading}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
    
            <input
              className="dashboard-input number-input"
              type="number"
              min="1"
              max="20"
              value={questionCount}
              onChange={(e) => setQuestionCount(Math.min(20, Math.max(1, e.target.value || 1)))}
              disabled={isLoading}
              placeholder="Questions"
            />
          </div>

          

          <div className="button-group">
            <button
              onClick={generateQuiz}
              className="dashboard-button"
              disabled={!topic.trim() || isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Quiz'}
            </button>

            {questions.length > 0 && (
              <button onClick={saveQuiz} className="dashboard-button save-button">
                Save Quiz
              </button>
            )}
          </div>
        </div>

        {questions.length > 0 && (
          <div className="quiz-preview">
            <h2 className="dashboard-subtitle">Preview</h2>
            {questions.map((q, i) => (
              <div key={i} className="question-item">
                <h3>Q{i+1}: {q.question}</h3>
                {q.options && (
                  <div className="options-list">
                    {q.options.map((opt, j) => <div key={j} className="option">{opt}</div>)}
                  </div>
                )}
                <div className="correct-answer">Answer: {q.answer}</div>
              </div>
            ))}
          </div>
        )}

        {savedQuizzes.length > 0 && (
          <div className="saved-quizzes">
            <h2 className="dashboard-subtitle">Your Quizzes ({savedQuizzes.length})</h2>
            <div className="quiz-list">
              {savedQuizzes.map(quiz => (
                <div key={quiz.id} className="quiz-item">
                  <div className="quiz-header">
                    <h3>{quiz.title}</h3>
                    {quiz.published && <span className="published-badge">Published</span>}
                  </div>
                  <p>{quiz.topic} | {quiz.questionCount} Qs | {quiz.timeLimit} mins</p>
                  <p>Created: {new Date(quiz.createdAt).toLocaleString()}</p>

                  <div className="quiz-actions">
                    <button
                      className="dashboard-button small-button"
                      onClick={() => {
                        setQuestions(quiz.questions);
                        setTopic(quiz.topic);
                        setDifficulty(quiz.difficulty);
                        setQuestionCount(quiz.questionCount);
                        setTimeLimit(quiz.timeLimit);
                      }}
                    >
                      Load
                    </button>

                    {!quiz.published ? (
                      <button
                        className="dashboard-button small-button publish-button"
                        onClick={() => publishQuiz(quiz.id)}
                      >
                        Publish
                      </button>
                    ) : (
                      <button
                        className="dashboard-button small-button"
                        onClick={() => navigate('/quiz-results', { state: { quiz } })}
                      >
                        Results ({getQuizResults(quiz.id).length})
                      </button>
                    )}

                    <button
                      className="dashboard-button small-button delete-button"
                      onClick={() => deleteQuiz(quiz.id)}
                    >
                      Delete
                    </button>
                  </div>

                  {quiz.published && (
                    <div className="quiz-stats">
                      <p>Attempts: {getQuizResults(quiz.id).length}</p>
                      {getQuizResults(quiz.id).length > 0 && (
                        <p>Avg Score: {Math.round(
                          getQuizResults(quiz.id).reduce((sum, r) => sum + (r.score/r.total*100), 0) / 
                          getQuizResults(quiz.id).length
                        )}%</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;