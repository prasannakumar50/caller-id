import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, CircularProgress, Alert, List, ListItem, ListItemText, Chip
} from '@mui/material';
import ReportIcon from '@mui/icons-material/Report';
import axios from 'axios';

const SpamReport = () => {
  const [form, setForm] = useState({ phoneNumber: '', reason: 'other', description: '' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'error' });
  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ show: false, message: '', severity: 'error' });
    try {
      await axios.post('/api/spam/report', form);
      setAlert({ show: true, message: 'Spam report submitted!', severity: 'success' });
      setForm({ phoneNumber: '', reason: 'other', description: '' });
    } catch (err) {
      setAlert({ show: true, message: err.response?.data?.message || 'Failed to submit report', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTrending = async () => {
      setTrendingLoading(true);
      try {
        const res = await axios.get('/api/spam/trending');
        setTrending(res.data.data.trending);
      } catch {
        setTrending([]);
      } finally {
        setTrendingLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          Report a Spam Number
        </Typography>
        {alert.show && <Alert severity={alert.severity} sx={{ mb: 2 }}>{alert.message}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <TextField
            label="Phone Number"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Reason"
            name="reason"
            value={form.reason}
            onChange={handleChange}
            select
            fullWidth
            SelectProps={{ native: true }}
            sx={{ mb: 2 }}
          >
            <option value="robocall">Robocall</option>
            <option value="scam">Scam</option>
            <option value="telemarketing">Telemarketing</option>
            <option value="harassment">Harassment</option>
            <option value="other">Other</option>
          </TextField>
          <TextField
            label="Description (optional)"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={2}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" color="secondary" startIcon={<ReportIcon />} disabled={loading}>
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Report Spam'}
          </Button>
        </Box>
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          Trending Spam Numbers
        </Typography>
        {trendingLoading ? (
          <Box sx={{ textAlign: 'center', py: 2 }}><CircularProgress /></Box>
        ) : (
          <List>
            {trending.map((item, idx) => (
              <ListItem key={idx} divider>
                <ListItemText
                  primary={item.phoneNumber}
                  secondary={`Reports: ${item.reportCount}`}
                />
                <Chip
                  label={`Spam: ${item.spamLikelihood}%`}
                  color={item.spamLikelihood >= 75 ? 'error' : item.spamLikelihood >= 50 ? 'warning' : 'success'}
                  sx={{ ml: 2 }}
                />
                <Chip label={item.riskLevel.replace('_', ' ')} color="secondary" sx={{ ml: 1 }} />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default SpamReport; 