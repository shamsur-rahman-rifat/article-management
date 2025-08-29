// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './auth/ProtectedRoute';
import RoleRoute from './auth/RoleRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Topics from './pages/Topics';
import Articles from './pages/Articles';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Team from './pages/Team';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/forgot" element={<ForgotPassword/>}/>
        <Route path="/" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
        <Route path="/projects" element={<RoleRoute roles={['admin']}><Projects/></RoleRoute>} />
        <Route path="/topics" element={<ProtectedRoute><Topics/></ProtectedRoute>} />
        <Route path="/articles" element={<ProtectedRoute><Articles/></ProtectedRoute>} />
        <Route path="/team" element={<Team/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </>
  );
}
