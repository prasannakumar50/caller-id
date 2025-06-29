import React from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import ReportIcon from '@mui/icons-material/Report';
import PersonIcon from '@mui/icons-material/Person';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.name || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          This is your CallerID Pro dashboard. Use the quick links below to get started.
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              onClick={() => navigate('/search')}
            >
              Search Numbers
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ContactPhoneIcon />}
              onClick={() => navigate('/contacts')}
            >
              My Contacts
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ReportIcon />}
              onClick={() => navigate('/spam-report')}
            >
              Report Spam
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="text"
              color="primary"
              startIcon={<PersonIcon />}
              onClick={() => navigate('/profile')}
            >
              My Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Dashboard; 