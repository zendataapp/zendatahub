import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search, Database, FileText, Hash, MessageCircle, Star, Download, Lock, Youtube, Instagram, Linkedin, Mail, X } from 'lucide-react';
import { cn } from '../lib/utils';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface DataBatch {
  id: string;
  title: string;
  description: string;
  category: string;
  qaCount: number;
  linesCount: number;
  charCount: number;
  isHero: boolean;
  fileUrl?: string;
  fileContent?: string;
  fileType?: string;
  fileName: string;
  createdAt: any;
}

export default function Index() {
  const [batches, setBatches] = useState<DataBatch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ qa: 0, lines: 0, chars: 0 });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showVideoPopup, setShowVideoPopup] = useState(false);

  useEffect(() => {
    // Fetch current logo safely
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

    const fetchVideo = async () => {
      try {
        const videoDoc = await getDoc(doc(db, 'settings', 'featuredVideo'));
        if (videoDoc.exists()) {
          const url = videoDoc.data().url;
          if (url) {
            setVideoUrl(url);
            // Check if shown in this session
            const isShown = sessionStorage.getItem('videoPopupShown');
            if (!isShown) {
              setShowVideoPopup(true);
              sessionStorage.setItem('videoPopupShown', 'true');
            }
          }
        }
      } catch (err) {
        console.error("Error fetching video:", err);
      }
    };
    fetchVideo();

    let unsubscribe = () => {};
    try {
      const q = query(collection(db, 'data_batches'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedBatches = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as DataBatch[];
        
        setBatches(fetchedBatches);
        
        // Calculate live stats
        let totalQa = 0;
        let totalLines = 0;
        let totalChars = 0;
        fetchedBatches.forEach(b => {
          totalQa += Number(b.qaCount) || 0;
          totalLines += Number(b.linesCount) || 0;
          totalChars += Number(b.charCount) || 0;
        });
        setStats({ qa: totalQa, lines: totalLines, chars: totalChars });
      }, (err) => {
        console.error("Firestore snapshot error:", err);
      });
    } catch (err) {
      console.error("Error setting up Firestore listener:", err);
    }

    return () => unsubscribe();
  }, []);

  const filteredBatches = batches.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const heroBatches = filteredBatches.filter(b => b.isHero);
  const normalBatches = filteredBatches.filter(b => !b.isHero);

  const handleWhatsApp = (text: string) => {
    const url = `https://wa.me/919520699063?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const getYouTubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
      <Header />

      {/* Video Popup Modal */}
      <AnimatePresence>
        {showVideoPopup && videoUrl && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVideoPopup(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#111] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl group cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                window.open(videoUrl, '_blank');
                setShowVideoPopup(false);
              }}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVideoPopup(false);
                }}
                className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="relative aspect-video">
                <img 
                  src={`https://img.youtube.com/vi/${getYouTubeID(videoUrl)}/maxresdefault.jpg`}
                  alt="Video Thumbnail"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Youtube className="w-10 h-10 text-white fill-current" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                  <p className="text-white font-bold text-xl">Watch our latest update on YouTube</p>
                  <p className="text-gray-300 text-sm">Click to watch the full video</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top CTA Bar */}
      <div className="bg-blue-600/10 border-b border-blue-500/20 backdrop-blur-md sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-lg leading-none bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Zendata Hub
              </span>
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-1">Data Intelligence</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button 
              onClick={() => handleWhatsApp("Hi, I'm interested in the Startup Pack (500 - 5000 QA).")}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium"
            >
              <MessageCircle className="w-4 h-4 text-green-400" />
              Startup: 500 - 5K QA
            </button>
            <button 
              onClick={() => handleWhatsApp("Hi, I'm interested in the Enterprise Pack (10k - 1 Lakhs QA).")}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium"
            >
              <MessageCircle className="w-4 h-4 text-green-400" />
              Enterprise: 10K - 1L QA
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            We don't teach patterns, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              we build the AI's brain.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
            Zendata is an open-source Hinglish complex multi-domain data hub where you find complex data, not basic. We teach AI logic, not patterns, which is why our data is different. You can use our batches for anything—ZendataHub allows it. We upload data built with our v3 engine here; paid plans will use the v5 engine.
          </p>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <StatCard icon={<Hash className="w-6 h-6 text-blue-400" />} label="Total QA Pairs" value={stats.qa.toLocaleString()} />
          <StatCard icon={<FileText className="w-6 h-6 text-purple-400" />} label="Total Lines" value={stats.lines.toLocaleString()} />
          <StatCard icon={<Database className="w-6 h-6 text-green-400" />} label="Total Characters" value={stats.chars.toLocaleString()} />
        </div>

        {/* Search */}
        <div className="relative max-w-2xl mx-auto mb-16">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 bg-[#111] border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xl"
            placeholder="Search complex data batches by keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Hero / Pro Data Section */}
        {heroBatches.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              <h2 className="text-3xl font-bold">Pro Data Batches</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {heroBatches.map(batch => (
                <DataCard key={batch.id} batch={batch} isPro />
              ))}
            </div>
          </div>
        )}

        {/* Normal Data Section */}
        <div>
          <h2 className="text-2xl font-bold mb-8 text-gray-200">Available Data Batches</h2>
          {normalBatches.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl bg-[#0a0a0a]">
              <Database className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No data batches found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {normalBatches.map(batch => (
                <DataCard key={batch.id} batch={batch} />
              ))}
            </div>
          )}
        </div>

        {/* Legal Sections */}
        <div id="legal" className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-gray-800/50 pt-20">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Privacy Policy
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              "Zendata Hub is a No-Login, Zero-Tracking platform. We do not collect, store, or sell any personal data of our visitors. Our mission is pure data accessibility with 100% anonymity."
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Terms of Service
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              "By using Zendata Hub, you agree that the datasets provided are for research and development. While we provide 'High-Strike Logic,' we are not liable for model behavior post-training. Commercial use of large batches requires a separate agreement."
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 bg-[#080808] py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Database className="w-4 h-4 text-blue-400" />
                </div>
                <span className="font-bold text-xl tracking-tight">Zendata Hub</span>
              </div>
              <p className="text-gray-500 text-sm mt-2">Empowering AI with high-quality complex data.</p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-6">
              <div className="flex gap-6 text-sm text-gray-400">
                <Link to="/about" className="hover:text-blue-400 transition-colors">About</Link>
                <Link to="/blogs" className="hover:text-blue-400 transition-colors">Blogs</Link>
                <a href="#legal" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
                <a href="#legal" className="hover:text-blue-400 transition-colors">Terms of Service</a>
                <div className="relative group">
                  <button className="hover:text-blue-400 transition-colors">Contact</button>
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#111] border border-gray-800 rounded-xl p-2 hidden group-hover:block shadow-2xl z-50">
                    <a 
                      href="https://wa.me/919520699063" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg text-xs text-gray-300 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-green-500" />
                      +91 9520699063
                    </a>
                    <a 
                      href="mailto:zendataofficial@gmail.com" 
                      className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg text-xs text-gray-300 transition-colors"
                    >
                      <Mail className="w-4 h-4 text-blue-500" />
                      zendataofficial@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <a 
                  href="https://linkedin.com/in/md-umair-241972393" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-400/50 transition-all"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://youtube.com/@zendataofficial" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500/50 transition-all"
                >
                  <Youtube className="w-5 h-5" />
                </a>
                <a 
                  href="https://instagram.com/zendatahub" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-pink-500 hover:border-pink-500/50 transition-all"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>

              <p className="text-gray-600 text-xs font-mono">
                © {new Date().getFullYear()} Zendata Hub. All rights reserved.
              </p>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-900 text-center">
            <p className="text-gray-700 text-[10px] uppercase tracking-[0.2em] font-bold">
              Built with Zendata v3 Engine • Powered by Intelligence
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 flex items-center gap-5 shadow-lg hover:border-gray-700 transition-colors">
      <div className="p-4 bg-black rounded-xl border border-gray-800">
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-bold font-mono text-gray-100">{value}</p>
      </div>
    </div>
  );
}

function DataCard({ batch, isPro = false }: { batch: DataBatch, isPro?: boolean }) {
  const handleDownload = () => {
    if (batch.fileContent) {
      const blob = new Blob([batch.fileContent], { type: batch.fileType || 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = batch.fileName || 'data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (batch.fileUrl) {
      window.open(batch.fileUrl, '_blank');
    }
  };

  return (
    <div className={cn(
      "group relative rounded-2xl p-6 flex flex-col h-full transition-all duration-300",
      isPro 
        ? "bg-gradient-to-b from-[#1a1500] to-[#0a0a0a] border border-yellow-900/50 hover:border-yellow-600/50" 
        : "bg-[#111] border border-gray-800 hover:border-blue-500/50"
    )}>
      {/* Green Badge */}
      <div className="absolute -top-3 left-6 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md shadow-[0_0_10px_rgba(34,197,94,0.2)]">
        You can use this data for absolutely anything
      </div>

      <div className="mt-4 mb-4">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="text-xl font-bold text-gray-100 group-hover:text-white transition-colors line-clamp-2">
            {batch.title}
          </h3>
          {isPro && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 shrink-0" />}
        </div>
        <span className="inline-block px-2.5 py-1 rounded-md bg-white/5 text-gray-400 text-xs font-medium mb-4">
          {batch.category}
        </span>
        <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
          {batch.description}
        </p>
      </div>

      <div className="mt-auto pt-6 border-t border-gray-800/50">
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="text-center p-2 rounded-lg bg-black/50">
            <p className="text-xs text-gray-500 mb-1">QA</p>
            <p className="font-mono text-sm font-semibold text-gray-200">{batch.qaCount}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-black/50">
            <p className="text-xs text-gray-500 mb-1">Lines</p>
            <p className="font-mono text-sm font-semibold text-gray-200">{batch.linesCount}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-black/50">
            <p className="text-xs text-gray-500 mb-1">Chars</p>
            <p className="font-mono text-sm font-semibold text-gray-200">{batch.charCount}</p>
          </div>
        </div>

        {(batch.fileUrl || batch.fileContent) ? (
          <button 
            onClick={handleDownload}
            className={cn(
              "flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium transition-all",
              isPro 
                ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" 
                : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
            )}
          >
            <Download className="w-4 h-4" />
            Download JSON
          </button>
        ) : (
          <button disabled className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium bg-gray-800/50 text-gray-500 cursor-not-allowed">
            No File Attached
          </button>
        )}
      </div>
    </div>
  );
}
