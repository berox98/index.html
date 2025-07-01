import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  Twitter, 
  ExternalLink, 
  Coins, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap,
  CheckCircle,
  Circle,
  Menu,
  X
} from 'lucide-react';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'roadmap', 'community'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const roadmapItems = [
    {
      phase: "Phase 1",
      title: "Foundation",
      status: "completed",
      items: [
        "Token Contract Development",
        "Initial Liquidity Pool",
        "Community Building",
        "Website Launch"
      ]
    },
    {
      phase: "Phase 2",
      title: "Growth",
      status: "in-progress",
      items: [
        "Marketing Campaign Launch",
        "Influencer Partnerships",
        "Exchange Listings",
        "Audit Completion"
      ]
    },
    {
      phase: "Phase 3",
      title: "Expansion",
      status: "upcoming",
      items: [
        "Mobile App Development",
        "NFT Collection Launch",
        "Staking Platform",
        "Governance Implementation"
      ]
    },
    {
      phase: "Phase 4",
      title: "Evolution",
      status: "upcoming",
      items: [
        "Cross-chain Integration",
        "DeFi Ecosystem",
        "Metaverse Integration",
        "Global Partnerships"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-red-500 to-yellow-400">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-red-600/90 backdrop-blur-md border-b border-yellow-300/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Coins className="h-8 w-8 text-yellow-300" />
              <span className="text-xl font-bold text-white">Nude Coin</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { id: 'home', label: 'Home' },
                { id: 'about', label: 'About' },
                { id: 'roadmap', label: 'Roadmap' },
                { id: 'community', label: 'Community' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`transition-colors duration-300 ${
                    activeSection === item.id
                      ? 'text-yellow-300 border-b-2 border-yellow-300'
                      : 'text-white hover:text-yellow-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-yellow-200 transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-red-700/90 backdrop-blur-md border-t border-yellow-300/30">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {[
                { id: 'home', label: 'Home' },
                { id: 'about', label: 'About' },
                { id: 'roadmap', label: 'Roadmap' },
                { id: 'community', label: 'Community' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-3 py-2 text-white hover:text-yellow-200 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Floating Animation Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-red-500/30 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-blue-500/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-40 left-20 w-16 h-16 bg-green-500/30 rounded-full animate-ping"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-yellow-500/30 rounded-full animate-pulse"></div>
        </div>

        <div className="text-center z-10 px-4">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full mb-6 animate-spin-slow border-4 border-white shadow-2xl">
              <Coins className="h-16 w-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 animate-fade-in drop-shadow-lg">
            Nude Coin
          </h1>
          
          <p className="text-xl md:text-2xl text-yellow-100 mb-8 max-w-2xl mx-auto animate-fade-in-delay drop-shadow-md">
            The next generation cryptocurrency revolutionizing the digital asset landscape
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-2">
            <a
              href="https://pump.fun/your-token-link"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-2 border-white"
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              Buy on Pump.fun
            </a>
            
            <button
              onClick={() => scrollToSection('about')}
              className="inline-flex items-center px-8 py-4 bg-blue-600 backdrop-blur-md text-white font-semibold rounded-full hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 border-2 border-white"
            >
              Learn More
              <ChevronDown className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-white drop-shadow-lg" />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-gradient-to-r from-green-400 to-blue-500">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">About Nude Coin</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto drop-shadow-md">
              Nude Coin represents a new era of transparent, community-driven cryptocurrency designed for the future of decentralized finance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-red-500/90 backdrop-blur-md rounded-2xl p-8 border-4 border-white hover:bg-red-600/90 transition-all duration-300 transform hover:scale-105 shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-6 border-2 border-white">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Security First</h3>
              <p className="text-white/90">
                Built with industry-leading security protocols and audited smart contracts to ensure your investments are protected.
              </p>
            </div>

            <div className="bg-blue-500/90 backdrop-blur-md rounded-2xl p-8 border-4 border-white hover:bg-blue-600/90 transition-all duration-300 transform hover:scale-105 shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-6 border-2 border-white">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Community Driven</h3>
              <p className="text-white/90">
                Our community is at the heart of everything we do. Join thousands of supporters building the future together.
              </p>
            </div>

            <div className="bg-green-500/90 backdrop-blur-md rounded-2xl p-8 border-4 border-white hover:bg-green-600/90 transition-all duration-300 transform hover:scale-105 shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-6 border-2 border-white">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Lightning Fast</h3>
              <p className="text-white/90">
                Experience instant transactions with minimal fees, powered by cutting-edge blockchain technology.
              </p>
            </div>
          </div>

          <div className="mt-16 bg-yellow-400/90 rounded-3xl p-8 md:p-12 border-4 border-white shadow-2xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-red-600 mb-6">Our Vision</h3>
                <p className="text-red-700 text-lg mb-6">
                  Nude Coin is more than just a cryptocurrency—it's a movement towards true financial freedom and transparency. We believe in creating a decentralized ecosystem where everyone has equal access to financial opportunities.
                </p>
                <p className="text-red-700 text-lg">
                  Our mission is to build a sustainable, community-driven platform that empowers individuals to take control of their financial future while fostering innovation in the DeFi space.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-48 h-48 bg-gradient-to-r from-red-500 to-blue-500 rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
                    <Coins className="h-24 w-24 text-white" />
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-red-500 to-blue-500 rounded-full blur opacity-30 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="py-20 px-4 bg-gradient-to-r from-red-500 to-yellow-400">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">Roadmap</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto drop-shadow-md">
              Our journey towards revolutionizing the cryptocurrency space, one milestone at a time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {roadmapItems.map((item, index) => (
              <div key={index} className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border-4 border-blue-500 hover:bg-white transition-all duration-300 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-white bg-red-500 px-3 py-1 rounded-full border-2 border-white">
                    {item.phase}
                  </span>
                  <div className={`flex items-center ${
                    item.status === 'completed' ? 'text-green-600' :
                    item.status === 'in-progress' ? 'text-yellow-600' : 'text-gray-500'
                  }`}>
                    {item.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-blue-600 mb-4">{item.title}</h3>
                
                <ul className="space-y-2">
                  {item.items.map((listItem, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm">{listItem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-20 px-4 bg-gradient-to-r from-blue-500 to-green-400">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">Join Our Community</h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto drop-shadow-md">
            Connect with thousands of Nude Coin supporters and stay updated on the latest developments.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <a
              href="https://twitter.com/your-twitter-handle"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-blue-600 rounded-2xl p-8 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-4 border-white"
            >
              <Twitter className="h-12 w-12 text-white mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-white mb-2">Follow us on Twitter</h3>
              <p className="text-blue-100">Stay updated with the latest news and announcements</p>
              <div className="mt-4 inline-flex items-center text-white font-semibold">
                Follow @NudeCoin
                <ExternalLink className="h-4 w-4 ml-2" />
              </div>
            </a>

            <a
              href="https://pump.fun/your-token-link"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-red-600 rounded-2xl p-8 hover:bg-red-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-4 border-white"
            >
              <TrendingUp className="h-12 w-12 text-white mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-white mb-2">Trade on Pump.fun</h3>
              <p className="text-red-100">Buy, sell, and trade Nude Coin on the leading platform</p>
              <div className="mt-4 inline-flex items-center text-white font-semibold">
                Start Trading
                <ExternalLink className="h-4 w-4 ml-2" />
              </div>
            </a>
          </div>

          <div className="bg-yellow-400/95 rounded-3xl p-8 border-4 border-white shadow-2xl">
            <h3 className="text-2xl font-bold text-red-600 mb-4">Ready to Get Started?</h3>
            <p className="text-red-700 mb-6">
              Join the Nude Coin revolution and be part of the future of decentralized finance.
            </p>
            <a
              href="https://pump.fun/your-token-link"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-2 border-white"
            >
              <Coins className="h-5 w-5 mr-2" />
              Buy Nude Coin Now
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-red-600 border-t-4 border-yellow-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Coins className="h-8 w-8 text-yellow-300" />
              <span className="text-xl font-bold text-white">Nude Coin</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <a
                href="https://twitter.com/your-twitter-handle"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-300 hover:text-white transition-colors"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="https://pump.fun/your-token-link"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-300 hover:text-white transition-colors"
              >
                <ExternalLink className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t-2 border-yellow-300 text-center">
            <p className="text-yellow-100">
              © 2024 Nude Coin. All rights reserved. Built for the future of decentralized finance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;