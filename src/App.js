import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Search from './components/Search';
import Profile from './components/Profile';
import SpamAlert from './components/SpamAlert';
import PrivateRoute from './components/PrivateRoute';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <BrowserRouter>
      <div className="container mt-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <PrivateRoute><Search /></PrivateRoute>
          } />
          <Route path="/profile/:phone" element={
            <PrivateRoute><Profile /></PrivateRoute>
          } />
          <Route path="/spam" element={
            <PrivateRoute><SpamAlert /></PrivateRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
