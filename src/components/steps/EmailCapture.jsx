import { useState } from 'react';
import useVisionStore from '../../store/useVisionStore';
import axios from 'axios';

export default function EmailCapture() {
  const {
    userName, setUserName, userEmail, setUserEmail,
    selections, intentions, nextStep, prevStep,
    isSubmitting, setSubmitting, setSubmitError, submitError,
  } = useVisionStore();

  const [emailValid, setEmailValid] = useState(true);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailChange = (e) => {
    setUserEmail(e.target.value);
    if (!emailValid) setEmailValid(validateEmail(e.target.value));
  };

  const handleEmailBlur = () => {
    if (userEmail) setEmailValid(validateEmail(userEmail));
  };

  const canSubmit = userName.trim() && userEmail.trim() && validateEmail(userEmail) && !isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await axios.post('/api/vision-board/submit', {
        name: userName.trim(),
        email: userEmail.trim(),
        selections,
        intentions: intentions.filter(i => i.trim()),
      });
      nextStep(); // Go to step 6 - Vision Board Display
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md mx-auto w-full py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-playfair font-bold text-dark-green mb-4">
            One Last Step
          </h1>
          <p className="text-secondary-text font-lato text-lg leading-relaxed">
            Share your email to get your personalised vision board.
            We'll send it so you can review it, share it with friends,
            and use it when you're ready to book your session.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-montserrat text-xs uppercase tracking-wider text-secondary-text mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Jane Doe"
              required
              className="w-full p-4 border border-gray-300 rounded-lg font-lato text-dark-green placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent"
            />
          </div>

          <div>
            <label className="block font-montserrat text-xs uppercase tracking-wider text-secondary-text mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              placeholder="jane@example.com"
              required
              className={`w-full p-4 border rounded-lg font-lato text-dark-green placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent ${
                !emailValid ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {!emailValid && (
              <p className="text-red-500 text-sm mt-1 font-lato">Please enter a valid email address</p>
            )}
          </div>

          {submitError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-lato">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full btn-coral flex items-center justify-center gap-2 py-4"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating Your Vision Board...
              </>
            ) : (
              'See My Vision Board'
            )}
          </button>

          <p className="text-center text-xs text-secondary-text font-lato mt-4">
            We respect your privacy. Your information will only be used to send your vision board
            and follow up about your photography session.
          </p>
        </form>
      </div>
    </div>
  );
}
