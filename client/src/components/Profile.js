import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, CircularProgress, Alert, Divider
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileAlert, setProfileAlert] = useState({ show: false, message: '', severity: 'error' });

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState({ show: false, message: '', severity: 'error' });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileAlert({ show: false, message: '', severity: 'error' });
    try {
      const res = await updateProfile(profile);
      if (res.success) {
        setProfileAlert({ show: true, message: 'Profile updated!', severity: 'success' });
      } else {
        setProfileAlert({ show: true, message: res.message, severity: 'error' });
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(p => ({ ...p, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordAlert({ show: false, message: '', severity: 'error' });
    try {
      const res = await changePassword(passwords.currentPassword, passwords.newPassword);
      if (res.success) {
        setPasswordAlert({ show: true, message: 'Password changed!', severity: 'success' });
        setPasswords({ currentPassword: '', newPassword: '' });
      } else {
        setPasswordAlert({ show: true, message: res.message, severity: 'error' });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>My Profile</Typography>
        <Box component="form" onSubmit={handleProfileSubmit} sx={{ mb: 3 }}>
          <TextField
            label="Name"
            name="name"
            value={profile.name}
            onChange={handleProfileChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            name="email"
            value={profile.email}
            onChange={handleProfileChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" color="primary" disabled={profileLoading}>
            {profileLoading ? <CircularProgress size={20} color="inherit" /> : 'Update Profile'}
          </Button>
          {profileAlert.show && <Alert severity={profileAlert.severity} sx={{ mt: 2 }}>{profileAlert.message}</Alert>}
        </Box>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>Change Password</Typography>
        <Box component="form" onSubmit={handlePasswordSubmit}>
          <TextField
            label="Current Password"
            name="currentPassword"
            type="password"
            value={passwords.currentPassword}
            onChange={handlePasswordChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="New Password"
            name="newPassword"
            type="password"
            value={passwords.newPassword}
            onChange={handlePasswordChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" color="secondary" disabled={passwordLoading}>
            {passwordLoading ? <CircularProgress size={20} color="inherit" /> : 'Change Password'}
          </Button>
          {passwordAlert.show && <Alert severity={passwordAlert.severity} sx={{ mt: 2 }}>{passwordAlert.message}</Alert>}
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile; 