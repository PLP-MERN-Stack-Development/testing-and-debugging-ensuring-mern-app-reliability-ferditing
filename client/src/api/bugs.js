function getAuthHeader() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchBugs() {
  const res = await fetch('/api/bugs', { headers: { ...getAuthHeader() } });
  if (!res.ok) throw new Error('Failed to fetch bugs');
  return res.json();
}

export async function createBug(data) {
  const res = await fetch('/api/bugs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Create failed');
  }
  return res.json();
}

export async function updateBug(id, updates) {
  const res = await fetch(`/api/bugs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Update failed');
  }
  return res.json();
}

export async function deleteBug(id) {
  const res = await fetch(`/api/bugs/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Delete failed');
  }
  return res.json();
}
