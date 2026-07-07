function Awareness() {
  return (
    <div className="container animate-fade-in">
      <div className="text-center mb-4">
        <h2>Cyber Security Awareness</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Learn how to identify fake job postings and protect your personal information from scammers.
        </p>
      </div>

      <div className="grid grid-cols-2">
        <div className="glass-card">
          <h3 style={{ color: 'var(--accent-color)' }}>Red Flags to Watch For</h3>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li>
              <strong>Unrealistic Salary:</strong> If the pay seems too good to be true for the required experience, it probably is.
            </li>
            <li>
              <strong>Requests for Payment:</strong> Legitimate employers will NEVER ask you to pay for training, equipment, or background checks upfront.
            </li>
            <li>
              <strong>Unofficial Communication:</strong> Be wary of recruiters who strictly use Telegram, WhatsApp, or public email domains (like @gmail.com) instead of a corporate domain.
            </li>
            <li>
              <strong>Immediate Hire:</strong> Offers made without an interview or background check are highly suspicious.
            </li>
            <li>
              <strong>Poor Grammar and Spelling:</strong> Professional job listings are usually thoroughly proofread.
            </li>
          </ul>
        </div>

        <div className="glass-card delay-100">
          <h3 style={{ color: 'var(--primary-color)' }}>How to Protect Yourself</h3>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li>
              <strong>Research the Company:</strong> Look up the company online, check their official website, and see if the job is listed on their careers page.
            </li>
            <li>
              <strong>Verify the Recruiter:</strong> Check the recruiter's LinkedIn profile and ensure they actually work for the company they claim to represent.
            </li>
            <li>
              <strong>Protect Personal Info:</strong> Never provide your Social Security Number, bank account details, or driver's license before formally accepting an offer and signing official paperwork.
            </li>
            <li>
              <strong>Use Our Tool:</strong> When in doubt, run the job description through our AI detector to spot hidden red flags.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Awareness;
