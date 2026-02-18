import { useState, useEffect } from 'react';
import useVisionStore from './store/useVisionStore';
import Welcome from './components/steps/Welcome';
import Gallery from './components/steps/Gallery';
import Intentions from './components/steps/Intentions';
import EmailCapture from './components/steps/EmailCapture';
import VisionBoard from './components/steps/VisionBoard';
import ThankYou from './components/steps/ThankYou';

function App() {
  const currentStep = useVisionStore((s) => s.currentStep);
  const [animating, setAnimating] = useState(false);
  const [displayStep, setDisplayStep] = useState(currentStep);

  useEffect(() => {
    if (currentStep !== displayStep) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setDisplayStep(currentStep);
        setAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep, displayStep]);

  const renderStep = () => {
    switch (displayStep) {
      case 1: return <Welcome />;
      case 2: return <Gallery />;
      case 3: return <Gallery />; // Gallery handles its own annotation modal
      case 4: return <Intentions />;
      case 5: return <EmailCapture />;
      case 6: return <VisionBoard />;
      case 7: return <ThankYou />;
      default: return <Welcome />;
    }
  };

  // Progress indicator — 4 visible steps mapped to internal step numbers
  const progressSteps = [
    { minStep: 1, label: 'Welcome' },
    { minStep: 2, label: 'Select' },
    { minStep: 4, label: 'Intentions' },
    { minStep: 5, label: 'Your Vision' },
  ];

  const showHeader = currentStep > 1 && currentStep < 6;

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header with logo + progress bar */}
      {showHeader && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-3">
            {/* Logo */}
            <p className="font-playfair text-sm text-dark-green text-center mb-3 tracking-wide">
              Ina J Photography
            </p>
            {/* Steps */}
            <div className="flex items-center justify-between">
              {progressSteps.map((step, idx) => (
                <div key={step.label} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-montserrat font-semibold transition-colors ${
                      currentStep >= step.minStep
                        ? 'bg-coral text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {currentStep > step.minStep ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : idx + 1}
                    </div>
                    <span className="text-[10px] font-montserrat mt-1 text-secondary-text whitespace-nowrap">
                      {step.label}
                    </span>
                  </div>
                  {idx < progressSteps.length - 1 && (
                    <div className={`w-8 sm:w-16 md:w-24 h-0.5 mx-1 mb-4 transition-colors ${
                      currentStep > step.minStep ? 'bg-coral' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className={showHeader ? 'pt-24' : ''}>
        <div
          className={`transition-all duration-300 ${
            animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}
        >
          {renderStep()}
        </div>
      </main>
    </div>
  );
}

export default App;
