import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button.jsx';

export default function BugList({ bugs = [], onUpdate, onDelete }) {
  if (!bugs.length) return <div role="status">No bugs reported</div>;
  return (
    <ul>
      {bugs.map((b) => (
        <li key={b._id} style={{ marginBottom: 8 }}>
          <strong>{b.title}</strong> <span>({b.status})</span>
          <div>{b.content}</div>
          <div>
            <Button onClick={() => onUpdate(b._id, { status: 'in-progress' })}>In Progress</Button>
            <Button onClick={() => onUpdate(b._id, { status: 'resolved' })}>Resolve</Button>
            <Button variant="danger" onClick={() => onDelete(b._id)}>Delete</Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

BugList.propTypes = { bugs: PropTypes.array, onUpdate: PropTypes.func.isRequired, onDelete: PropTypes.func.isRequired };
