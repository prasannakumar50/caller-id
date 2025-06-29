// src/components/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const { data } = await API.post('/login', { phone, password });
      localStorage.setItem('token', data.token);
      alert("Login successful");
      navigate('/');
    } catch (err) {
      alert('Login failed. Check credentials.');
    }
  };

  return (
    <div>
      <h2>Login with Phone</h2>
      <label>Phone Number: </label>
      <input
        type="text"
        placeholder="Phone Number"
        required
        onChange={(e) => setPhone(e.target.value)}
      />
      <br />
      <label>Password: </label>
      <input
        type="password"
        placeholder="Password"
        required
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      
      <button onClick={handleLogin}>Login</button>
      <Link className='btn btn-primary text-white' to="/register">Register</Link>
    </div>
  );
}
