import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

export default function Search() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const searchName = async () => {
    try {
      const { data } = await API.get(`/search/name?q=${q}`);
      setResults(data);
    } catch {
      alert('Search failed');
    }
  };

  const searchPhone = async () => {
    try {
      const { data } = await API.get(`/search/number?phone=${q}`);
      setResults(data);
    } catch {
      alert('Search failed');
    }
  };

  return (
    <div>
      <h2>Search</h2>
      <input placeholder="Name or Phone" value={q} onChange={e => setQ(e.target.value)} />
      <button onClick={searchName}>Search Name</button>
      <button onClick={searchPhone}>Search Phone</button>

      <ul>
        {results.map((r, i) => (
          <li key={i}>
            {r.name} - {r.phone} - Spam: {r.spamLikelihood ?? 'N/A'}
            <button onClick={() => navigate(`/profile/${r.phone}`)}>View</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
