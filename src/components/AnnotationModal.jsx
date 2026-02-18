import { useState, useEffect } from 'react';
import useVisionStore from '../store/useVisionStore';

const MAX_CHARS = 250;

export default function AnnotationModal({ image, onClose }) {
  const { getAnnotation, setAnnotation } = useVisionStore();
  const [text, setText] = useState('');

  useEffect(() => {
    const existing = getAnnotation(image.id);
    setText(existing || '');
  }, [image.id, getAnnotation]);

  const handleSave = () => {
    setAnnotation(image.id, text);
    onClose();
  };

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={image.imageUrl}
            alt={image.filename}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6">
          <h3 className="font-playfair text-xl font-bold text-dark-green mb-2">
            What emotion does this image evoke for you?
          </h3>
          <p className="text-secondary-text text-sm font-lato mb-4">
            Share what draws you to this image and what feelings it stirs.
          </p>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
            placeholder="This image makes me feel..."
            className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none font-lato text-dark-green placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent"
            autoFocus
          />

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-secondary-text font-montserrat">
              {text.length}/{MAX_CHARS}
            </span>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={onClose} className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg font-montserrat text-sm font-medium text-dark-green hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="flex-1 btn-coral text-sm py-2.5 px-4">
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
