import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role is "student"
  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();

    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];

    // Check if user already exists
    if (existingUsers.some(user => user.email === email)) {
      alert("User already exists! Please log in.");
      return;
    }

    // Store new user with selected role
    const newUser = { email, password, role };
    localStorage.setItem('users', JSON.stringify([...existingUsers, newUser]));

    alert("Account created successfully! Please log in.");
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="container">
        <div className="heading">Sign Up</div>
        <form className="form" onSubmit={handleSignUp}>
          <input
            required
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            required
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          {/* New Role Selection Dropdown */}
          <select
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>

          <button className="login-button" type="submit">Create Account</button>
        </form>
      </div>
    </div>
  );
}