import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-[#fcfcfd]">
      <div className="max-w-md w-full text-center space-y-8 animate-in slide-in-from-bottom-8 duration-700">
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping"></div>
          <div className="relative bg-white border border-slate-100 p-8 rounded-full shadow-2xl">
            <ShieldAlert className="w-16 h-16 text-primary" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-7xl font-black text-slate-900 tracking-tighter">404</h1>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Connection Lost</h2>
          <p className="text-slate-500 font-medium">
            The page you are looking for has either moved to a new system node or no longer exists in our database.
          </p>
        </div>

        <Link 
          to="/" 
          className="inline-flex items-center gap-3 bg-primary text-white font-bold text-sm tracking-widest uppercase px-8 py-4 rounded-full shadow-xl shadow-primary/20 hover:scale-105 hover:bg-primary/90 transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
