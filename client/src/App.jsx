import React, { useEffect, useState } from 'react';
import BugForm from './components/BugForm.jsx';
import BugList from './components/BugList.jsx';
import * as api from './api/bugs';

export default function App() {
  const [bugs, setBugs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.fetchBugs()
      .then(setBugs)
      .catch((err) => setError(err.message || 'Failed to load'));
  }, []);

  const handleCreate = async (data) => {
    try {
      const created = await api.createBug(data);
      setBugs((s) => [created, ...s]);
    } catch (err) {
      setError(err.message || 'Create failed');
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const updated = await api.updateBug(id, updates);
      setBugs((s) => s.map((b) => (b._id === id ? updated : b)));
    } catch (err) {
      setError(err.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteBug(id);
      setBugs((s) => s.filter((b) => b._id !== id));
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Bug Tracker</h1>
      {error && <div role="alert">{error}</div>}
      <BugForm onCreate={handleCreate} />
      <hr />
      <BugList bugs={bugs} onUpdate={handleUpdate} onDelete={handleDelete} />
    </div>
  );
}
