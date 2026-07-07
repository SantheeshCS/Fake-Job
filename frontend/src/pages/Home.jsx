import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container animate-fade-in">
      <div className="text-center" style={{ marginTop: '4rem', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>AI-Powered Fake Job Detection</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', marginBottom: '2.5rem' }}>
          Protect yourself from employment scams. Our advanced AI model analyzes job postings for linguistic patterns and cyber risk factors to keep your career safe.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/detect" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
            Detect a Scam Now
          </Link>
          <Link to="/awareness" className="btn glass-card" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
            Learn More
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 delay-100 animate-fade-in" style={{ marginTop: '4rem' }}>
        <div className="glass-card">
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤖</div>
          <h3>Advanced AI Model</h3>
          <p style={{ color: 'var(--text-muted)' }}>Trained on thousands of real and fake job postings to detect subtle anomalies.</p>
        </div>
        <div className="glass-card">
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛡️</div>
          <h3>Cyber Risk Rules</h3>
          <p style={{ color: 'var(--text-muted)' }}>Analyzes contact methods, email domains, and payment requests to score risk.</p>
        </div>
        <div className="glass-card">
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚡</div>
          <h3>Instant Results</h3>
          <p style={{ color: 'var(--text-muted)' }}>Get a confidence score and detailed breakdown of red flags in seconds.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
