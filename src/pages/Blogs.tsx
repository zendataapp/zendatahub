import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FileText, ArrowLeft, Calendar, User, ArrowRight, Database } from 'lucide-react';
import Header from '../components/Header';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface Blog {
  id: string;
  title: string;
  shortSummary: string;
  content: string;
  createdAt: any;
}

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBlogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Blog[];
      setBlogs(fetchedBlogs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Zendata <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Insights</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Deep dives into AI data logic, Hinglish nuances, and the future of Indic LLMs.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 bg-[#111] border border-gray-800 rounded-3xl">
            <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400">No insights published yet. Stay tuned!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-[#111] border border-gray-800 rounded-3xl p-8 hover:border-purple-500/50 transition-all flex flex-col h-full"
              >
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 font-mono uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {blog.createdAt?.toDate().toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    MD Umair
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-4 group-hover:text-purple-400 transition-colors leading-tight">
                  {blog.title}
                </h2>
                <p className="text-gray-400 leading-relaxed mb-8 flex-1">
                  {blog.shortSummary}
                </p>
                <Link 
                  to={`/blog/${blog.id}`}
                  className="inline-flex items-center gap-2 text-purple-400 font-bold hover:gap-3 transition-all group/link"
                >
                  Read Full Insight
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-gray-800/50 text-center">
        <p className="text-gray-600 text-sm font-mono">
          © {new Date().getFullYear()} Zendata Hub. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
