import useVisionStore from '../../store/useVisionStore';

const artworkOptions = [
  {
    id: 'hero-wall-art',
    title: 'Hero Wall Art',
    description: 'One stunning large-scale piece that becomes the centrepiece of your room.',
    imageUrl: 'https://assets.cdn.filesafe.space/zjeSHehmlKxLOGbKffZc/media/6a34c2e76a6dd1b69a1b692e.jpeg',
  },
  {
    id: 'wall-collection',
    title: 'Wall Collection',
    description: 'Multiple pieces arranged together to tell a bigger story across your wall.',
    imageUrl: 'https://assets.cdn.filesafe.space/zjeSHehmlKxLOGbKffZc/media/6a34c2cade4900e889aba617.jpg',
  },
  {
    id: 'storyboard-collage',
    title: 'Storyboard Collage',
    description: 'A curated multi-image layout on a single frame. Your session story at a glance.',
    imageUrl: 'https://assets.cdn.filesafe.space/zjeSHehmlKxLOGbKffZc/media/6a34c911de4900e889ac22ab.jpg',
  },
  {
    id: 'portrait-box',
    title: 'Portrait Box',
    description: 'A collection of beautifully matted prints in a keepsake presentation box.',
    imageUrl: 'https://assets.cdn.filesafe.space/zjeSHehmlKxLOGbKffZc/media/6a34c2cfde4900e889aba6ef.jpg',
  },
  {
    id: 'album',
    title: 'Album',
    description: 'A beautifully bound photo album to treasure and share for years to come.',
    imageUrl: 'https://assets.cdn.filesafe.space/zjeSHehmlKxLOGbKffZc/media/6a34c592c50697c4116ca653.jpg',
  },
  {
    id: 'gift-prints',
    title: 'Matted Fine Art Prints',
    description: 'Beautiful fine art prints perfect for gifting to family and friends who love your dog too.',
    imageUrl: 'https://assets.cdn.filesafe.space/zjeSHehmlKxLOGbKffZc/media/6a34c9546a6dd1b69a1bef4f.jpg',
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
                className={`group relative text-left rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                  selected
                    ? 'border-coral shadow-md'
                    : 'border-gray-200 bg-white hover:border-coral/40 hover:shadow-sm'
                }`}
              >
                {selected && (
                  <div className="absolute top-3 right-3 z-10 w-7 h-7 bg-coral rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={option.imageUrl}
                    alt={option.title}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                      selected ? 'scale-105' : 'group-hover:scale-105'
                    }`}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-montserrat font-semibold text-dark-green text-sm mb-1">
                    {option.title}
                  </h3>
                  <p className="font-lato text-secondary-text text-xs leading-relaxed">
                    {option.description}
                  </p>
                </div>
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
            Generate My Vision Board
          </button>
        </div>

        <p className="text-center text-xs text-secondary-text font-lato mt-6">
          This is just to get you dreaming. No commitment at all.
        </p>
      </div>
    </div>
  );
}
