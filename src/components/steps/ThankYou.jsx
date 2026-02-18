export default function ThankYou() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-xl mx-auto text-center py-12">
        {/* Celebration icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-dark-green mb-6">
          Your Vision Board is on its way!
        </h1>

        <p className="text-lg text-secondary-text font-lato leading-relaxed mb-10">
          We've sent your personalised vision board to your email.
          Check your inbox (and spam folder, just in case!) in the next few minutes.
        </p>

        {/* What happens next */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-10 text-left">
          <h3 className="font-playfair text-xl font-bold text-dark-green mb-5 text-center">
            What Happens Next
          </h3>
          <div className="space-y-4">
            {[
              'Review your vision board and share it with anyone you\'d like',
              'We\'ll review your preferences and reach out within 24 hours with personalised session options',
              'Schedule your complimentary consultation to discuss your vision and answer any questions',
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-coral text-white rounded-full flex items-center justify-center text-sm font-montserrat font-semibold mt-0.5">
                  {idx + 1}
                </span>
                <p className="font-lato text-dark-green">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-4">
          <a
            href="https://www.inajphotography.com/booking"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-coral block text-lg py-4"
          >
            Schedule Your Complimentary Consultation
          </a>

          <div className="flex gap-4">
            <a
              href="https://instagram.com/inajphotography"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-montserrat font-medium text-dark-green hover:bg-gray-50 transition-colors text-center"
            >
              Explore More of Our Work
            </a>
            <a
              href="https://www.inajphotography.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-montserrat font-medium text-dark-green hover:bg-gray-50 transition-colors text-center"
            >
              Visit Our Website
            </a>
          </div>
        </div>

        <p className="mt-10 text-sm text-secondary-text font-montserrat tracking-wider uppercase">
          Ina J Photography
        </p>
      </div>
    </div>
  );
}
