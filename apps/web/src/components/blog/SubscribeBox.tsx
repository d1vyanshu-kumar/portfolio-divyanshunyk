import { useState } from 'react';
import confetti from 'canvas-confetti';
import { subscribeEmail } from '@/lib/supabase';

interface SubscribeBoxProps {
  variant?: 'banner' | 'compact';
}

export default function SubscribeBox({ variant = 'banner' }: SubscribeBoxProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await subscribeEmail(email);
      if (res.success) {
        setStatus('success');
        setMessage(res.message);
        setEmail('');

        // Fire celebratory confetti!
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.75 },
            colors: ['#FF5436', '#FF7A62', '#3DDC84', '#F59E0B', '#38BDF8'],
          });
        } catch {}
      } else {
        setStatus('error');
        setMessage(res.message);
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <section className={"subscribe-box subscribe-" + variant}>
      <div className="subscribe-inner">
        <div className="subscribe-header">
          <span className="subscribe-badge">⚡ STAY IN THE LOOP</span>
          <h3 className="subscribe-title">
            {variant === 'banner'
              ? 'Get notified when the next post drops.'
              : 'Enjoyed this read? Never miss the next one.'}
          </h3>
          <p className="subscribe-desc">
            Unfiltered notes on distributed systems, tech architecture, goals, and life lessons. Zero spam, high signal only.
          </p>
        </div>

        {status === 'success' ? (
          <div className="subscribe-success-card">
            <span className="subscribe-success-icon">🎉</span>
            <div>
              <h4 className="subscribe-success-title">You are on the list!</h4>
              <p className="subscribe-success-desc">{message}</p>
            </div>
            <button
              type="button"
              className="subscribe-reset-btn"
              onClick={() => {
                setStatus('idle');
                setMessage('');
              }}
            >
              Add another email
            </button>
          </div>
        ) : (
          <form className="subscribe-form" onSubmit={handleSubscribe}>
            <div className="subscribe-input-wrapper">
              <span className="subscribe-input-icon">✉️</span>
              <input
                type="email"
                className="subscribe-input"
                placeholder="your.email@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === 'loading'}
                aria-label="Email address for subscription"
              />
            </div>
            <button
              type="submit"
              className="subscribe-submit-btn"
              disabled={status === 'loading' || !email.trim()}
            >
              {status === 'loading' ? (
                <span className="subscribe-spinner" aria-hidden="true" />
              ) : (
                'Subscribe'
              )}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="subscribe-error-msg">⚠️ {message}</p>
        )}

        <div className="subscribe-footer">
          <span>🔒 No spam, ever</span>
          <span>·</span>
          <span>Unsubscribe anytime in 1-click</span>
        </div>
      </div>
    </section>
  );
}
