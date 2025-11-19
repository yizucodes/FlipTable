import React from 'react';

const LandingPage = ({ onStartDemo }) => {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm fixed w-full z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src="/fliptable-logo.svg" alt="FlipTable Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900">FlipTable</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-willow-500 font-medium">How it Works</a>
              <a href="#features" className="text-gray-600 hover:text-willow-500 font-medium">Features</a>
              <a href="#impact" className="text-gray-600 hover:text-willow-500 font-medium">Impact</a>
            </nav>
            <button 
              onClick={onStartDemo}
              className="bg-willow-400 hover:bg-willow-500 text-white px-5 py-2 rounded-full font-semibold transition-colors shadow-sm"
            >
              Launch Demo
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Flip Waste into <span className="text-willow-500">Revenue</span> <br className="hidden sm:block" /> in Minutes
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10">
            An AI-powered platform that uses escrow-backed demand aggregation to help restaurants liquidate surplus food while saving buyers money.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={onStartDemo}
              className="bg-willow-400 hover:bg-willow-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              See it in Action
            </button>
            <a 
              href="https://youtu.be/87bVUQeYr0g" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Watch Video</span>
            </a>
          </div>
          <div className="mt-16 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-400 uppercase tracking-wider">Powered By</span>
            </div>
          </div>
          <div className="mt-8 flex justify-center gap-8 grayscale opacity-60">
             {/* Placeholder for partner logos - using text for now */}
             <span className="font-bold text-xl">ElevenLabs</span>
             <span className="font-bold text-xl">Locus</span>
             <span className="font-bold text-xl">Base</span>
             <span className="font-bold text-xl">Y Combinator</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-willow-500 font-semibold tracking-wide uppercase">The Process</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              From Escrow to Payment
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              We automate the negotiation and sales process for surplus food.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-willow-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm">1</div>
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Escrow Aggregation</h3>
              <p className="text-gray-600">Buyers commit money in escrow with food preferences (e.g., "pizza, Mission District").</p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-willow-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm">2</div>
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Negotiation</h3>
              <p className="text-gray-600">Our AI agent calls restaurants with proof of demand and negotiates a bulk deal.</p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-willow-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm">3</div>
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Matching</h3>
              <p className="text-gray-600">Smart algorithm matches top buyers to inventory and instantly refunds others.</p>
            </div>

            {/* Step 4 */}
            <div className="relative p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-willow-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm">4</div>
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Seamless Payment</h3>
              <p className="text-gray-600">USDC payment releases to the restaurant on Base blockchain upon pickup.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features / Tech Stack */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-willow-500 font-semibold tracking-wide uppercase">Under the Hood</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Cutting-Edge Technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">ElevenLabs AI</h3>
              <p className="text-gray-600">Conversational voice agent that sounds human and negotiates effectively using real-time data.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Locus & Claude</h3>
              <p className="text-gray-600">Intelligent payment agents powered by Anthropic's Claude SDK and Locus MCP tools.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Base Blockchain</h3>
              <p className="text-gray-600">Fast, low-cost settlement using USDC ensures restaurants get paid instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-willow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6">
            Ready to stop wasting food?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join the platform that turns loss into profit and surplus into savings.
          </p>
          <button 
            onClick={onStartDemo}
            className="bg-white text-willow-500 hover:bg-gray-50 px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-colors"
          >
            Start Live Demo
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
             <div className="flex items-center gap-2 mb-4">
              <img src="/fliptable-logo.svg" alt="FlipTable Logo" className="w-8 h-8" />
              <span className="text-xl font-bold">FlipTable</span>
            </div>
            <p className="text-gray-400 max-w-xs">
              Built at YC Locus Hackathon 2025. Flipping waste into revenue, one meal at a time.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Home</a></li>
              <li><a href="#how-it-works" className="hover:text-white">How it Works</a></li>
              <li><a href="https://github.com/yourusername/fliptable" className="hover:text-white">GitHub</a></li>
            </ul>
          </div>
          <div>
             <h4 className="text-lg font-semibold mb-4">Contact</h4>
             <p className="text-gray-400">team@fliptable.com</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          &copy; 2025 FlipTable. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

