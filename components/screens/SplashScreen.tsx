import React from 'react';
import { VasatiLogo } from '../VasatiLogo';
import { ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="relative w-full h-full min-h-[780px] bg-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* Top Section with VASATI Branding */}
      <div className="pt-8 pb-4 px-6 flex flex-col items-center">
        <VasatiLogo size="lg" showTagline={true} />
      </div>

      {/* Center Section: Premium PG Building Card */}
      <div className="px-6 flex-1 flex flex-col items-center justify-center">
        <div className="relative w-full max-w-[340px] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/60 group">
          <img
            src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"
            alt="VASATI Premium PG Residence"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-vasati-purple flex items-center gap-1 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Verified Stays
          </div>
        </div>

        {/* Motivational Headings */}
        <div className="text-center mt-6">
          <h2 className="text-2xl font-extrabold text-vasati-dark tracking-tight">
            Find Your Perfect PG
          </h2>
          <p className="text-sm font-medium text-vasati-secondary mt-1">
            Stay Better, Live Happier
          </p>
        </div>
      </div>

      {/* Bottom Section: Purple Curved Background & Action Buttons */}
      <div className="relative w-full bg-gradient-to-t from-vasati-royal via-vasati-purple to-vasati-purple-vibrant rounded-t-[2.5rem] pt-8 pb-8 px-6 text-center text-white shadow-2xl">
        <button
          onClick={onGetStarted}
          className="w-full py-4 px-6 rounded-full bg-white text-vasati-purple font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all duration-200 hover:bg-vasati-purple-soft hover:shadow-xl active:scale-[0.98]"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5 text-vasati-purple" />
        </button>

        <button
          onClick={onLogin}
          className="mt-3.5 text-sm font-semibold text-purple-200 hover:text-white transition-colors"
        >
          Login
        </button>
      </div>
    </div>
  );
};

