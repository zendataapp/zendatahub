import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Database } from 'lucide-react';

export default function Header() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const logoDoc = await getDoc(doc(db, 'settings', 'appearance'));
        if (logoDoc.exists()) {
          setLogoUrl(logoDoc.data().logoUrl);
        }
      } catch (err) {
        console.error("Error fetching logo:", err);
      }
    };
    fetchLogo();
  }, []);

  return (
    <nav className="border-b border-gray-800/50 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Zendata Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              ) : (
                <Database className="w-6 h-6 text-blue-400" />
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight group-hover:text-blue-400 transition-colors leading-none">
              Zendata Hub
            </span>
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-1">Data Intelligence</span>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Hub</Link>
          <Link to="/blogs" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Insights</Link>
          <Link to="/about" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">About</Link>
        </div>
      </div>
    </nav>
  );
}
