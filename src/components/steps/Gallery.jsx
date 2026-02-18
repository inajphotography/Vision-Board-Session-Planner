import { useState, useMemo } from 'react';
import useVisionStore from '../../store/useVisionStore';
import { galleryData, moods, settings, styles } from '../../data/gallery';
import AnnotationModal from '../AnnotationModal';

export default function Gallery() {
  const {
    selections, toggleImage, isSelected, removeImage,
    activeFilters, setFilter, clearFilters, setStep
  } = useVisionStore();

  const [annotatingImage, setAnnotatingImage] = useState(null);
  const [imageLoadStates, setImageLoadStates] = useState({});

  const filteredImages = useMemo(() => {
    return galleryData.filter(img => {
      if (activeFilters.mood && img.mood !== activeFilters.mood) return false;
      if (activeFilters.setting && img.setting !== activeFilters.setting) return false;
      if (activeFilters.style && img.style !== activeFilters.style) return false;
      return true;
    });
  }, [activeFilters]);

  const handleImageClick = (image) => {
    if (isSelected(image.id)) {
      setAnnotatingImage(image);
    } else {
      if (selections.length >= 8) return;
      toggleImage(image);
      setAnnotatingImage(image);
    }
  };

  const handleAnnotationClose = () => {
    setAnnotatingImage(null);
  };

  const handleRemoveFromTray = (imageId) => {
    removeImage(imageId);
  };

  const canProceed = selections.length >= 4;

  const handleNext = () => {
    setStep(4);
  };

  const handleImageLoad = (imageId) => {
    setImageLoadStates(prev => ({ ...prev, [imageId]: true }));
  };

  return (
    <div className="pb-32">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-playfair font-bold text-dark-green mb-4">
            Explore & Select
          </h1>
          <p className="text-secondary-text font-lato text-lg max-w-2xl mx-auto">
            Choose 4-8 images that capture the feeling you want for your session.
          </p>
        </div>

        {/* Gallery grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map(image => (
            <div
              key={image.id}
              className={`gallery-image relative rounded-lg overflow-hidden cursor-pointer aspect-[3/4] ${
                isSelected(image.id) ? 'ring-3 ring-coral' : ''
              }`}
              onClick={() => handleImageClick(image)}
            >
              {!imageLoadStates[image.id] && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
              <img
                src={image.imageUrl}
                alt={image.filename}
                className="w-full h-full object-cover"
                loading="lazy"
                onLoad={() => handleImageLoad(image.id)}
              />
              {isSelected(image.id) && (
                <div className="absolute top-2 right-2 w-7 h-7 bg-coral rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-xs font-montserrat">{image.mood} · {image.setting}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-16">
            <p className="text-secondary-text font-lato text-lg">No images match your filters.</p>
            <button onClick={clearFilters} className="text-coral font-montserrat mt-2 hover:underline">
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Selection tray */}
      <div className="fixed bottom-0 left-0 right-0 bg-white selection-tray z-30 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-x-auto flex-1 mr-4">
              {selections.length === 0 ? (
                <p className="text-secondary-text font-lato text-sm">Select images to build your vision board</p>
              ) : (
                selections.map(sel => (
                  <div key={sel.imageId} className="relative flex-shrink-0">
                    <img
                      src={sel.imageUrl}
                      alt={sel.filename}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveFromTray(sel.imageId); }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-dark-green text-white rounded-full flex items-center justify-center text-xs hover:bg-coral transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <span className="font-montserrat text-sm text-secondary-text">
                {selections.length} of 8 selected
              </span>
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className="btn-coral text-sm px-6 py-2.5"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Annotation modal */}
      {annotatingImage && (
        <AnnotationModal
          image={annotatingImage}
          onClose={handleAnnotationClose}
        />
      )}
    </div>
  );
}
