function Contact() {
  return (
    <div className="container animate-fade-in">
      <div className="text-center mb-4">
        <h2>Contact Us</h2>
        <p style={{ color: 'var(--text-muted)' }}>Have a question or want to report a scam? Get in touch.</p>
      </div>

      <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={(e) => { e.preventDefault(); alert("Thanks for reaching out! This is a demo."); }}>
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input type="text" className="form-control" required placeholder="John Doe" />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" required placeholder="john@example.com" />
          </div>

          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="form-control" required placeholder="How can we help you?"></textarea>
          </div>

          <button type="submit" className="btn btn-accent" style={{ width: '100%' }}>
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}

export default Contact;
