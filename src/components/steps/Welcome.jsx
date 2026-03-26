import useVisionStore from '../../store/useVisionStore';

export default function Welcome() {
  const nextStep = useVisionStore((s) => s.nextStep);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <p className="font-montserrat text-sm tracking-[0.2em] uppercase text-secondary-text mb-6">
            Ina J Photography
          </p>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-bold text-dark-green leading-tight mb-8">
          Design your dream pet photography session in under 5 minutes.
        </h1>

        <p className="text-lg text-secondary-text font-lato leading-relaxed mb-12 max-w-xl mx-auto">
          Pick the images that speak to you, tell us what matters most, and
          we'll create a personalised session vision board you can keep, share,
          and bring to your consultation call.
        </p>

        <button onClick={nextStep} className="btn-coral text-lg px-10 py-4">
          Start Building Your Vision
        </button>

        <p className="mt-8 text-sm text-secondary-text font-lato">
          Free &middot; takes about 3-5 minutes
        </p>
      </div>
    </div>
  );
}
