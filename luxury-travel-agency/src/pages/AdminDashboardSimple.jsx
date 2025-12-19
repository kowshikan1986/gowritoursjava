import React, { useState } from 'react';

const AdminDashboardSimple = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'G0wr!T0ur$') {
      setUser({ username: 'admin' });
    } else {
      alert('Invalid credentials. Use admin / G0wr!T0ur$');
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return (
      <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto' }}>
        <h1 style={{ color: '#6A1B82', textAlign: 'center' }}>Admin Login</h1>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '15px',
              background: '#6A1B82',
              color: 'white',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          Default: admin / G0wr!T0ur$
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '50px' }}>
      <div style={{ background: 'yellow', padding: '30px', border: '5px solid green', marginBottom: '20px' }}>
        <h1 style={{ color: 'green', fontSize: '3rem' }}>ADMIN DASHBOARD WORKS!</h1>
        <p style={{ fontSize: '1.5rem' }}>Welcome, {user.username}!</p>
        <button
          onClick={handleLogout}
          style={{
            padding: '15px 30px',
            background: 'red',
            color: 'white',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
      <div style={{ background: '#f0f0f0', padding: '20px' }}>
        <h2>This is a simplified admin dashboard.</h2>
        <p>If you see this, React is working correctly!</p>
        <p>The issue is with the complex AdminDashboard component.</p>
      </div>
    </div>
  );
};

export default AdminDashboardSimple;
