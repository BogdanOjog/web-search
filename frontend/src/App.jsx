import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import './index.css';

export default function App() {
  // Citim datele direct la inițializarea variabilei (sincron)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('movieUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/movies" /> : <Login onLogin={setUser} />} 
        />
        <Route 
          path="/movies" 
          element={user ? <Dashboard user={user} onLogout={() => setUser(null)} /> : <Navigate to="/" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}