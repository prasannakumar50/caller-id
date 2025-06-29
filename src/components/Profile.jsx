import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';

export default function Profile() {
  const { phone } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    API.get(`/profile/${phone}`).then(res => setProfile(res.data));
  }, [phone]);

  return (
    <div>
      <h2>Profile</h2>
      {profile ? (
        <>
          <p>Name: {profile.name}</p>
          <p>Phone: {profile.phone}</p>
          {profile.email && <p>Email: {profile.email}</p>}
          <p>Spam Likelihood: {profile.spamLikelihood}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
