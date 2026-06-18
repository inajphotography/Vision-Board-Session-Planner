import useVisionStore from '../../store/useVisionStore';

const artworkOptions = [
  {
    id: 'hero-wall-art',
    title: 'Hero Wall Art',
    description: 'One stunning large-scale piece that becomes the centrepiece of your room.',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="8" y="10" width="32" height="28" rx="2" />
        <path d="M8 30l10-8 6 5 8-7 8 6" />
        <circle cx="18" cy="20" r="3" />
      </svg>
    ),
  },
  {
    id: 'wall-collection',
    title: 'Wall Collection',
    description: 'Multiple pieces arranged together to tell a bigger story across your wall.',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="8" width="16" height="14" rx="1" />
        <rect x="24" y="8" width="20" height="14" rx="1" />
        <rect x="4" y="26" width="20" height="14" rx="1" />
        <rect x="28" y="26" width="16" height="14" rx="1" />
      </svg>
    ),
  },
  {
    id: 'storyboard-collage',
    title: 'Storyboard Collage',
    description: 'A curated multi-image layout on a single frame — your session story at a glance.',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="6" y="6" width="36" height="36" rx="2" />
        <line x1="6" y1="24" x2="42" y2="24" />
        <line x1="24" y1="6" x2="24" y2="24" />
        <line x1="20" y1="24" x2="20" y2="42" />
      </svg>
    ),
  },
  {
    id: 'portrait-box',
    title: 'Portrait Box',
    description: 'A collection of beautifully matted prints in a keepsake presentation box.',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="8" y="14" width="32" height="24" rx="2" />
        <path d="M8 14l4-6h24l4 6" />
        <rect x="14" y="19" width="10" height="14" rx="1" />
        <rect x="26" y="19" width="8" height="8" rx="1" />
      </svg>
    ),
  },
  {
    id: 'album',
    title: 'Album',
    description: 'A beautifully bound photo album to treasure and share for years to come.',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="10" y="6" width="28" height="36" rx="2" />
        <path d="M10 6v36" />
        <line x1="14" y1="6" x2="14" y2="42" />
        <rect x="18" y="14" width="16" height="12" rx="1" />
      </svg>
    ),
  },
  {
    id: 'gift-prints',
    title: 'Gift Prints',
    description: 'Smaller prints perfect for gifting to family and friends who love your dog too.',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="10" y="18" width="28" height="24" rx="2" />
        <path d="M10 24h28" />
        <line x1="24" y1="18" x2="24" y2="42" />
        <path d="M24 18c-4-6-10-8-10-4s6 4 10 4" />
        <path d="M24 18c4-6 10-8 10-4s-6 4-10 4" />
      </svg>
    ),
  },
];

export { artworkOptions };

export default function ArtworkPreference() {
  const { artworkPreferences, toggleArtworkPreference, nextStep, prevStep } = useVisionStore();

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-playfair font-bold text-dark-green mb-4">
            How Would You Like to Enjoy Your Photos?
          </h1>
          <p className="text-secondary-text font-lato text-lg leading-relaxed max-w-xl mx-auto">
            Your photos deserve to be more than files on a phone. Choose the formats
            that excite you most — select as many as you like.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {artworkOptions.map((option) => {
            const selected = artworkPreferences.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleArtworkPreference(option.id)}
                className={`group relative text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                  selected
                    ? 'border-coral bg-coral/5 shadow-md'
                    : 'border-gray-200 bg-white hover:border-coral/40 hover:shadow-sm'
                }`}
              >
                {selected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-coral rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className={`mb-3 ${selected ? 'text-coral' : 'text-dark-green/60 group-hover:text-coral/70'} transition-colors`}>
                  {option.icon}
                </div>
                <h3 className="font-montserrat font-semibold text-dark-green text-sm mb-1">
                  {option.title}
                </h3>
                <p className="font-lato text-secondary-text text-xs leading-relaxed">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            className="px-6 py-3 text-secondary-text font-montserrat hover:text-dark-green transition-colors"
          >
            &larr; Back
          </button>
          <button
            onClick={nextStep}
            className="btn-coral px-8 py-3"
          >
            Continue
          </button>
        </div>

        <p className="text-center text-xs text-secondary-text font-lato mt-6">
          This is just to get you dreaming — no commitment at all.
        </p>
      </div>
    </div>
  );
}
