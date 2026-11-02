import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, LayoutDashboard, BarChart3, TrendingUp } from 'lucide-react';
import Button from '../components/common/Button';
import Footer from '../components/layout/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Simple Header */}
      <header className="absolute top-0 w-full p-6 z-10 flex justify-between items-center max-w-7xl mx-auto inset-x-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">C</div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">CareerSync</span>
        </div>
        <div className="flex space-x-4">
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary">Sign Up</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse delay-75"></div>

        {/* Two-column layout for Hero */}
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10 animate-fade-in relative">
          
          {/* Left Text content */}
          <div className="text-left flex flex-col items-start pt-10">
            <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-primary-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              <span>Placements 2026 Now Live</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
              Your Gateway to <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-500">
                Campus Placements
              </span>
            </h1>
            
            <p className="text-lg text-slate-500 max-w-lg mb-10 leading-relaxed">
              Discover opportunities, track your applications, and accelerate your placement journey with CareerSync's comprehensive platform.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto group">
                  Sign Up Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Image Content */}
          <div className="relative w-full h-[500px] hidden lg:flex items-center justify-center p-8">
             <div className="absolute inset-0 bg-gradient-to-tr from-primary-100 to-transparent rounded-3xl -rotate-3 blur-md opacity-50"></div>
             <img 
                src="https://res.cloudinary.com/dionysus2359/image/upload/v1776513021/istockphoto-2208521424-612x612_fo7bxf.jpg" 
                alt="Students collaborating" 
                className="w-full h-full object-cover rounded-3xl shadow-glass-lg relative z-10"
             />
             
             {/* Floating Stats Badge on Image */}
             <div className="absolute bottom-12 -left-6 z-20 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-glass-lg flex items-center space-x-4 border border-white">
                <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-800">95%</p>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Success Rate</p>
                </div>
             </div>
          </div>

        </div>

        {/* Features Section - Matches Part 3 */}
        <section id="features" className="mt-32 w-full max-w-6xl z-10 text-center">
          <h4 className="text-sm font-bold tracking-widest text-primary-600 uppercase mb-4">Powerful Features</h4>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-800 tracking-tight leading-tight mb-16">
            Everything you need for a successful<br/>placement journey
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="glass-card p-10 h-full flex flex-col hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-8">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Browse Jobs</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Access curated job listings from top-tier companies tailored to your specific field and expertise.</p>
            </div>
            
            <div className="glass-card p-10 h-full flex flex-col hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-8">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Track Applications</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Keep a close eye on your application status in real-time. Never miss an interview or a deadline again.</p>
            </div>
            
            <div className="glass-card p-10 h-full flex flex-col hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-8">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Placement Analytics</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Gain insights into placement trends, average packages, and company requirements through data visualization.</p>
            </div>
          </div>
        </section>

        {/* How It Works Section - Matches Part 2 */}
        <section className="mt-40 w-full max-w-6xl z-10 flex flex-col md:flex-row items-start justify-between gap-16 pb-20">
          <div className="md:w-1/3 text-left">
            <h4 className="text-sm font-bold tracking-widest text-primary-600 uppercase mb-4">The Process</h4>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 tracking-tight leading-tight mb-6">
              How It Works
            </h2>
            <p className="text-slate-500 text-lg">
              We've simplified the journey from campus life to corporate career into four strategic steps.
            </p>
          </div>

          <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-16 text-left">
            <div>
              <div className="text-5xl font-bold text-primary-200 mb-4">01</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Sign Up</h3>
              <p className="text-slate-500 text-sm">Create your professional profile with your credentials, skills, and academic history.</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary-200 mb-4">02</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Browse</h3>
              <p className="text-slate-500 text-sm">Explore a wide variety of job openings and internships from visiting companies.</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary-200 mb-4">03</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Apply</h3>
              <p className="text-slate-500 text-sm">Submit your applications directly to the companies that align with your career goals.</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary-200 mb-4">04</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Track</h3>
              <p className="text-slate-500 text-sm">Monitor the progress of your applications and get notified of upcoming recruitment phases.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
