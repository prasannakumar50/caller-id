import React, { useState } from 'react';
import API from '../api';

export default function SpamMark() {
  const [phone, setPhone] = useState('');

  const handleSpam = async () => {
    try {
      await API.post('/spam', { phone });
      alert('Marked as spam');
    } catch {
      alert('Failed to mark as spam');
    }
  };

  return (
    <div>
      <h2>Mark as Spam</h2>
      <input placeholder="Phone" onChange={e => setPhone(e.target.value)} />
      <button onClick={handleSpam}>Submit</button>
    </div>
  );
}
