import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Lock, FileText, Plus, Trash2, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Blog {
  id: string;
  title: string;
  shortSummary: string;
  content: string;
  createdAt: any;
}

export default function BlogAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Simple session check (optional, but good for UX if they refresh)
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '786 Umair') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="bg-[#111] p-8 rounded-3xl border border-gray-800 w-full max-w-md shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-purple-500/10 rounded-full">
              <Lock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-8">Blog Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
            >
              Access Blog Admin
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link to="/uma-hidden-786" className="text-sm text-gray-500 hover:text-white transition-colors">
              Back to Main Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <BlogDashboard />;
}

function BlogDashboard() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    shortSummary: '',
    content: '',
  });

  useEffect(() => {
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBlogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Blog[];
      setBlogs(fetchedBlogs);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await addDoc(collection(db, 'blogs'), {
        ...formData,
        createdAt: serverTimestamp(),
      });

      setSuccessMsg('Blog post published successfully!');
      setFormData({ title: '', shortSummary: '', content: '' });
    } catch (err: any) {
      console.error("Error adding blog:", err);
      setErrorMsg('Failed to publish blog post.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    setIsDeleting(id);
    try {
      await deleteDoc(doc(db, 'blogs', id));
      setSuccessMsg('Blog post deleted.');
    } catch (err) {
      console.error("Error deleting blog:", err);
      setErrorMsg('Failed to delete blog.');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <Link to="/uma-hidden-786" className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Main Admin Panel
            </Link>
            <h1 className="text-3xl font-bold">Blog Management</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/blogs" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition-colors">
              View Blogs Page
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Blog Form */}
          <div className="lg:col-span-1">
            <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 shadow-2xl sticky top-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-500" />
                New Blog Post
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Blog Title</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Enter catchy title..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Short Summary</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.shortSummary}
                    onChange={(e) => setFormData({...formData, shortSummary: e.target.value})}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                    placeholder="Briefly describe what the blog is about..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Full Content (Markdown supported)</label>
                  <textarea
                    required
                    rows={10}
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none font-sans"
                    placeholder="Write your full blog content here..."
                  />
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="flex items-center gap-2 text-green-400 bg-green-400/10 p-3 rounded-lg text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    {successMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                  Publish Blog
                </button>
              </form>
            </div>
          </div>

          {/* Blogs List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold mb-4">Published Blogs ({blogs.length})</h2>
            {blogs.length === 0 ? (
              <div className="text-center py-20 bg-[#111] border border-gray-800 rounded-3xl">
                <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">No blogs published yet.</p>
              </div>
            ) : (
              blogs.map((blog) => (
                <div key={blog.id} className="bg-[#111] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors group">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-100 mb-2">{blog.title}</h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{blog.shortSummary}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-600 font-mono">
                        <span>ID: {blog.id}</span>
                        <span>Published: {blog.createdAt?.toDate().toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(blog.id, blog.title)}
                      disabled={isDeleting === blog.id}
                      className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      {isDeleting === blog.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
