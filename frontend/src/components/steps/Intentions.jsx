import useVisionStore from '../../store/useVisionStore';

const placeholders = [
  "I want to capture her playful spirit...",
  "I want to feel his unconditional love...",
  "A memory of our quiet bond...",
];

const MAX_CHARS = 100;

export default function Intentions() {
  const { intentions, setIntention, nextStep, prevStep } = useVisionStore();
  const hasAtLeastOne = intentions.some(i => i.trim().length > 0);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-xl mx-auto w-full py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-playfair font-bold text-dark-green mb-4">
            Define Your Core Desires.
          </h1>
          <p className="text-secondary-text font-lato text-lg">
            In a few words, what are the most important feelings or memories
            you want to capture during your session?
          </p>
        </div>

        <div className="space-y-6">
          {intentions.map((intention, idx) => (
            <div key={idx}>
              <label className="block font-montserrat text-xs uppercase tracking-wider text-secondary-text mb-2">
                Intention {idx + 1}
              </label>
              <textarea
                value={intention}
                onChange={(e) => setIntention(idx, e.target.value.slice(0, MAX_CHARS))}
                placeholder={placeholders[idx]}
                className="w-full p-4 border border-gray-300 rounded-lg resize-none font-lato text-dark-green placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent h-20"
              />
              <div className="text-right">
                <span className="text-xs text-secondary-text font-montserrat">
                  {intention.length}/{MAX_CHARS}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-10">
          <button
            onClick={prevStep}
            className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-montserrat font-medium text-dark-green hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={nextStep}
            disabled={!hasAtLeastOne}
            className="flex-1 btn-coral"
          >
            Next: Capture Your Email
          </button>
        </div>
      </div>
    </div>
  );
}
