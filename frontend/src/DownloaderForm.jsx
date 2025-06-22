import React, { useState } from 'react';

function DownloaderForm() {
  const [videoUrl, setVideoUrl] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleDownload = async (e) => {
    e.preventDefault();
    setResult(null);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_url: videoUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.error || 'Unknown error');
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleDownload} style={{ maxWidth: 500, margin: '2rem auto' }}>
      <input
        type="text"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        placeholder="Enter YouTube URL"
        required
        style={{ width: '80%', padding: '0.5rem', fontSize: '1rem' }}
      />
      <button type="submit" style={{ padding: '0.5rem 1rem', marginLeft: 10 }}>Download</button>
      {result && (
        <div style={{ marginTop: 20, background: "#e0ffe0", padding: 15 }}>
          <h3>Success!</h3>
          <p><strong>Title:</strong> {result.title}</p>
          <p><strong>Saved as:</strong> {result.filename}</p>
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: 20 }}>{error}</div>}
    </form>
  );
}

export default DownloaderForm;