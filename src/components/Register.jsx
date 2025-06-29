// src/components/Register.js
import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      await API.post('/register', form);
      alert("Registration successful. Please login.");
      navigate('/login');
    } catch (err) {
      alert("Registration failed. Phone may already be used.");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input name="name" placeholder="Name" onChange={handleChange} /><br />
      <input name="phone" placeholder="Phone Number" onChange={handleChange} /><br />
      <input name="email" placeholder="Email (optional)" onChange={handleChange} /><br />
      <input name="password" placeholder="Password" type="password" onChange={handleChange} /><br />
      <button onClick={handleSubmit}>Register</button>
    </div>
  );
}
