import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Tabs, Tab, CircularProgress, Alert, List, ListItem, ListItemText, Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

const Search = () => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('name');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const res = await axios.get(`/api/search?q=${encodeURIComponent(query)}&type=${type}`);
      setResults(res.data.data.results);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          Search People or Numbers
        </Typography>
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 2 }}>
          <Tabs value={type} onChange={(_, v) => setType(v)} sx={{ mb: 2 }}>
            <Tab label="By Name" value="name" />
            <Tab label="By Phone Number" value="phone" />
          </Tabs>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label={type === 'name' ? 'Name' : 'Phone Number'}
              value={query}
              onChange={e => setQuery(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Search'}
            </Button>
          </Box>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {results.length > 0 && (
          <List>
            {results.map((result, idx) => (
              <ListItem key={idx} divider>
                <ListItemText
                  primary={result.name}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">{result.phoneNumber}</Typography>
                      {result.email && (
                        <>
                          {' | '}
                          <Typography component="span" variant="body2" color="text.secondary">{result.email}</Typography>
                        </>
                      )}
                    </>
                  }
                />
                <Chip
                  label={`Spam: ${result.spamLikelihood}%`}
                  color={result.spamLikelihood >= 75 ? 'error' : result.spamLikelihood >= 50 ? 'warning' : 'success'}
                  sx={{ ml: 2 }}
                />
                {result.isRegisteredUser && (
                  <Chip label="Registered" color="primary" sx={{ ml: 1 }} />
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default Search; 