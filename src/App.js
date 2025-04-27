import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import StudentQuiz from './StudentQuiz';
import QuizResults from './QuizResults';
import SignUpPage from './SignUpPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/quiz" element={<StudentQuiz />} />
        <Route path="/quiz-results" element={<QuizResults />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;