import { useRef } from 'react';
import useVisionStore from '../../store/useVisionStore';

export default function VisionBoard() {
  const { selections, intentions, userName, getSessionBrief, nextStep } = useVisionStore();
  const boardRef = useRef(null);

  const brief = getSessionBrief();

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-playfair font-bold text-dark-green mb-4">
            Your Emotional Vision Board is Ready!
          </h1>
          <p className="text-secondary-text font-lato text-lg">
            {userName ? `${userName}, here` : 'Here'} is your personalized session vision.
          </p>
        </div>

        {/* Vision Board */}
        <div ref={boardRef} className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 mb-8">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b border-gray-100">
            <p className="font-montserrat text-xs tracking-[0.2em] uppercase text-secondary-text mb-2">
              Ina J Photography
            </p>
            <h2 className="font-playfair text-2xl font-bold text-dark-green">
              Session Vision Board
            </h2>
            {userName && (
              <p className="font-lato text-secondary-text mt-1">Created for {userName}</p>
            )}
          </div>

          {/* Image Grid */}
          <div className={`grid gap-4 mb-8 ${
            selections.length <= 4 ? 'grid-cols-2' :
            selections.length <= 6 ? 'grid-cols-2 md:grid-cols-3' :
            'grid-cols-2 md:grid-cols-4'
          }`}>
            {selections.map((sel) => (
              <div key={sel.imageId} className="space-y-2">
                <div className="aspect-[3/4] rounded-lg overflow-hidden">
                  <img
                    src={sel.imageUrl}
                    alt={sel.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
                {sel.annotation && (
                  <p className="text-sm text-dark-green font-lato italic leading-snug">
                    "{sel.annotation}"
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Emotional Intentions */}
          {intentions.filter(i => i.trim()).length > 0 && (
            <div className="mb-8 p-6 bg-ivory rounded-xl">
              <h3 className="font-playfair text-lg font-bold text-dark-green mb-4">
                Your Emotional Intentions
              </h3>
              <div className="space-y-3">
                {intentions.filter(i => i.trim()).map((intention, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-coral mt-0.5">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <p className="font-lato text-dark-green">{intention}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session Brief */}
          <div className="p-6 bg-dark-green/5 rounded-xl">
            <h3 className="font-playfair text-lg font-bold text-dark-green mb-3">
              Session Brief
            </h3>
            <p className="font-lato text-dark-green leading-relaxed">
              Your vision focuses on a{' '}
              <strong>{brief.moods.join(' and ')}</strong> mood in{' '}
              <strong>{brief.settings.join(' and ')}</strong> settings, capturing a mix of{' '}
              <strong>{brief.styleDesc}</strong> moments.
            </p>
          </div>
        </div>

        {/* Consultation CTA */}
        <div className="text-center bg-ivory rounded-2xl p-8 sm:p-10">
          <h3 className="font-playfair text-2xl font-bold text-dark-green mb-3">
            Ready to Bring This Vision to Life?
          </h3>
          <p className="text-secondary-text font-lato text-lg mb-6 max-w-lg mx-auto">
            Let's chat about how we can capture your dog's unique soul in a way that honors your bond.
          </p>
          <a
            href="https://www.inajphotography.com/booking"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-coral text-lg px-10 py-4 inline-block"
          >
            Schedule Your Complimentary Consultation
          </a>
          <p className="text-secondary-text font-lato text-sm mt-4">
            Your vision board has been sent to your email for reference.
          </p>
        </div>
      </div>
    </div>
  );
}
