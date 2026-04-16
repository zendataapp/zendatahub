import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, Calendar, User, Share2, Database } from 'lucide-react';
import Header from '../components/Header';
import { motion } from 'motion/react';

interface Blog {
  id: string;
  title: string;
  shortSummary: string;
  content: string;
  createdAt: any;
}

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, 'blogs', id));
        if (docSnap.exists()) {
          setBlog({ id: docSnap.id, ...docSnap.data() } as Blog);
        }
      } catch (err) {
        console.error("Error fetching blog post:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-4">Insight Not Found</h1>
        <p className="text-gray-400 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
        <Link to="/blogs" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors">
          Back to Insights
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-4 text-xs text-gray-500 font-mono uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {blog.createdAt?.toDate().toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              MD Umair
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            {blog.title}
          </h1>

          <div className="p-6 bg-purple-500/5 border-l-4 border-purple-500 rounded-r-2xl italic text-gray-300 leading-relaxed">
            {blog.shortSummary}
          </div>

          <div className="prose prose-invert prose-purple max-w-none">
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
              {blog.content}
            </div>
          </div>

          <div className="pt-20 border-t border-gray-800/50 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden">
                  <span className="text-sm font-bold text-blue-400">MU</span>
                </div>
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-sm">MD Umair</p>
                <p className="text-xs text-gray-500">Founder, Zendata Hub</p>
              </div>
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-sm font-medium"
            >
              <Share2 className="w-4 h-4" />
              Share Insight
            </button>
          </div>
        </motion.div>
      </main>

      <footer className="py-12 border-t border-gray-800/50 text-center">
        <p className="text-gray-600 text-sm font-mono">
          © {new Date().getFullYear()} Zendata Hub. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
