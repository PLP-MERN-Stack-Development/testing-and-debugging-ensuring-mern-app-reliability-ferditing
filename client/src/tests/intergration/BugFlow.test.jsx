import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';
import * as api from '../../api/bugs';

jest.mock('../../api/bugs');

describe('Bug flow (integration)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows empty state and can create bug', async () => {
    api.fetchBugs.mockResolvedValueOnce([]);
    render(<App />);
    expect(await screen.findByRole('status')).toHaveTextContent(/no bugs reported/i);

    const created = { _id: '1', title: 'New Bug', content: 'Bug content', status: 'open' };
    api.createBug.mockResolvedValueOnce(created);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Bug' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Bug content' } });
    fireEvent.click(screen.getByRole('button', { name: /report bug/i }));

    await waitFor(() => expect(screen.getByText('New Bug')).toBeInTheDocument());
    expect(api.createBug).toHaveBeenCalledTimes(1);
  });

  it('shows error when create fails', async () => {
    api.fetchBugs.mockResolvedValueOnce([]);
    api.createBug.mockRejectedValueOnce(new Error('Create failed'));
    render(<App />);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'X' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Y' } });
    fireEvent.click(screen.getByRole('button', { name: /report bug/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });
});
