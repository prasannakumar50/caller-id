import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, List, ListItem, ListItemText, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, CircularProgress, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phoneNumber: '', email: '' });
  const [formError, setFormError] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/contacts');
      setContacts(res.data.data.contacts);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await axios.delete(`/api/contacts/${id}`);
      setContacts(contacts.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to delete contact');
    }
  };

  const handleAdd = async () => {
    setFormError('');
    if (!form.name || !form.phoneNumber) {
      setFormError('Name and phone number are required');
      return;
    }
    setAdding(true);
    try {
      const res = await axios.post('/api/contacts', form);
      setContacts([...contacts, res.data.data.contact]);
      setOpen(false);
      setForm({ name: '', phoneNumber: '', email: '' });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add contact');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">My Contacts</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Add Contact
          </Button>
        </Box>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <List>
            {contacts.map(contact => (
              <ListItem key={contact.id} divider secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(contact.id)}>
                  <DeleteIcon />
                </IconButton>
              }>
                <ListItemText
                  primary={contact.name}
                  secondary={<>
                    <Typography component="span" variant="body2">{contact.phoneNumber}</Typography>
                    {contact.email && (
                      <>
                        {' | '}
                        <Typography component="span" variant="body2" color="text.secondary">{contact.email}</Typography>
                      </>
                    )}
                  </>}
                />
                <Chip
                  label={`Spam: ${contact.spamLikelihood || 0}%`}
                  color={contact.spamLikelihood >= 75 ? 'error' : contact.spamLikelihood >= 50 ? 'warning' : 'success'}
                  sx={{ ml: 2 }}
                />
                {contact.isRegisteredUser && (
                  <Chip label="Registered" color="primary" sx={{ ml: 1 }} />
                )}
              </ListItem>
            ))}
          </List>
        )}
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Add Contact</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Name"
              fullWidth
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            <TextField
              margin="dense"
              label="Phone Number"
              fullWidth
              value={form.phoneNumber}
              onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
            />
            <TextField
              margin="dense"
              label="Email (optional)"
              fullWidth
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
            {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} variant="contained" disabled={adding}>{adding ? <CircularProgress size={20} /> : 'Add'}</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Contacts; 