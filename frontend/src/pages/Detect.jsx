import { useState } from 'react';

function Detect() {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    email: '',
    website: '',
    contact: '',
    salary: '',
    telecommuting: false,
    has_company_logo: false,
    has_questions: false
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to the analysis engine');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in">
      <div className="text-center mb-4">
        <h2>Analyze Job Posting</h2>
        <p style={{ color: 'var(--text-muted)' }}>Paste the details of a suspicious job posting below for AI analysis.</p>
      </div>

      <div className="grid grid-cols-2">
        <div className="glass-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input type="text" name="company" className="form-control" value={formData.company} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Job Description</label>
              <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} required></textarea>
            </div>

            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Company Website</label>
                <input type="url" name="website" className="form-control" value={formData.website} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Contact Method (e.g. WhatsApp)</label>
                <input type="text" name="contact" className="form-control" value={formData.contact} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Promised Salary</label>
                <input type="number" name="salary" className="form-control" value={formData.salary} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="telecommuting" checked={formData.telecommuting} onChange={handleChange} /> Remote
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="has_company_logo" checked={formData.has_company_logo} onChange={handleChange} /> Has Logo
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="has_questions" checked={formData.has_questions} onChange={handleChange} /> Screening Questions
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Analyzing...' : 'Scan Job Posting'}
            </button>
          </form>
        </div>

        <div className="glass-card delay-100 animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3>Analysis Results</h3>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '2rem' }}>
            {!result && !error && !loading && (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <p>Submit a job posting to see the AI analysis results here.</p>
              </div>
            )}

            {loading && (
              <div style={{ color: 'var(--primary-color)' }}>Analyzing data...</div>
            )}

            {error && (
              <div style={{ color: 'var(--danger-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❌</div>
                <p>{error}</p>
              </div>
            )}

            {result && (
              <div style={{ width: '100%' }} className="animate-fade-in">
                <div style={{ 
                  padding: '1.5rem', 
                  borderRadius: 'var(--radius-md)', 
                  background: result.is_fake ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  border: `1px solid ${result.is_fake ? 'var(--danger-color)' : 'var(--success-color)'}`,
                  textAlign: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <h2 style={{ color: result.is_fake ? 'var(--danger-color)' : 'var(--success-color)', marginBottom: '0.5rem' }}>
                    {result.is_fake ? '⚠️ Fake Job Detected' : '✅ Legitimate Job'}
                  </h2>
                  <p>AI Confidence: {result.confidence.toFixed(2)}%</p>
                </div>

                <div className="mb-3">
                  <h4>Risk Level: <span className={result.trust_score < 40 ? 'badge badge-high' : result.trust_score < 80 ? 'badge badge-medium' : 'badge badge-low'}>{result.risk_level}</span></h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Rule-based Trust Score: {result.trust_score}/100</p>
                </div>

                {result.reasons && result.reasons.length > 0 && (
                  <div>
                    <h4 style={{ color: 'var(--warning-color)' }}>Red Flags Detected:</h4>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-color)', marginTop: '0.5rem' }}>
                      {result.reasons.map((reason, idx) => (
                        <li key={idx} style={{ marginBottom: '0.25rem' }}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Detect;
