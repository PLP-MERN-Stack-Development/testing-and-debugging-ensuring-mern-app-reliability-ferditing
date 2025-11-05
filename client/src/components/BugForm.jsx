import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from './Button.jsx';

export default function BugForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!title || !content) return;
    onCreate({ title, content });
    setTitle('');
    setContent('');
  };

  return (
    <form onSubmit={submit}>
      <div>
        <label>Title: <input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Title" /></label>
      </div>
      <div>
        <label>Description: <textarea value={content} onChange={(e) => setContent(e.target.value)} aria-label="Description" /></label>
      </div>
      <Button type="submit">Report Bug</Button>
    </form>
  );
}

BugForm.propTypes = { onCreate: PropTypes.func.isRequired };
