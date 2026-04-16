import React, { useState, useRef, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { Lock, Upload, FileJson, CheckCircle2, AlertCircle, Loader2, Trash2, Database, ImagePlus, BookOpen, Youtube } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

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

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '786 Umair') {
      setIsAuthenticated(true);
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
            <div className="p-4 bg-blue-500/10 rounded-full">
              <Lock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-8">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              Access Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [batches, setBatches] = useState<DataBatch[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isSavingVideo, setIsSavingVideo] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    qaCount: 0,
    isHero: false,
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    // Fetch current logo
    const fetchLogo = async () => {
      const logoDoc = await getDoc(doc(db, 'settings', 'appearance'));
      if (logoDoc.exists()) {
        setLogoUrl(logoDoc.data().logoUrl);
      }
    };

    const fetchVideo = async () => {
      const videoDoc = await getDoc(doc(db, 'settings', 'featuredVideo'));
      if (videoDoc.exists()) {
        setVideoUrl(videoDoc.data().url || '');
      }
    };

    fetchLogo();
    fetchVideo();
    
    const q = query(collection(db, 'data_batches'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBatches = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DataBatch[];
      setBatches(fetchedBatches);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveVideo = async () => {
    setIsSavingVideo(true);
    try {
      await setDoc(doc(db, 'settings', 'featuredVideo'), { 
        url: videoUrl,
        updatedAt: serverTimestamp()
      });
      setSuccessMsg('Featured video updated successfully!');
    } catch (err: any) {
      setErrorMsg('Failed to update video link: ' + err.message);
    } finally {
      setIsSavingVideo(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      console.log("Starting direct database upload for file:", file.name);
      
      // Read file content as text
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          console.log("File read successful, length:", content.length);
          
          // Auto-calculate lines and characters
          const autoLinesCount = content.split('\n').filter(line => line.trim() !== '').length;
          const autoCharCount = content.length;

          // Save everything to Firestore
          const docRef = await addDoc(collection(db, 'data_batches'), {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            qaCount: Number(formData.qaCount),
            linesCount: autoLinesCount,
            charCount: autoCharCount,
            isHero: formData.isHero,
            fileContent: content,
            fileName: file.name,
            fileType: file.type || 'application/json',
            createdAt: serverTimestamp(),
          });

          console.log("Document saved with ID:", docRef.id);
          setSuccessMsg('Data batch uploaded successfully!');
          setIsUploading(false);
          setUploadProgress(0);
          
          setFormData({
            title: '',
            description: '',
            category: 'General',
            qaCount: 0,
            isHero: false,
          });
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (dbErr: any) {
          console.error("Database Error:", dbErr);
          setErrorMsg(`Database error: ${dbErr.message}`);
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setErrorMsg("Failed to read file content.");
        setIsUploading(false);
      };

      reader.readAsText(file);

    } catch (err: any) {
      console.error("FULL UPLOAD ERROR:", err);
      setErrorMsg(`Upload failed: ${err.message || 'Check console for details'}`);
      setIsUploading(false);
    }
  };

  const handleDelete = async (batch: DataBatch) => {
    if (!window.confirm(`Are you sure you want to delete "${batch.title}"? This will remove it from the database and delete the file.`)) {
      return;
    }

    setIsDeleting(batch.id);
    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, 'data_batches', batch.id));

      // 2. Delete file from Storage if it exists (legacy)
      if (batch.fileUrl) {
        try {
          // Extract file path from URL (basic extraction, might need refinement based on exact URL structure)
          const urlObj = new URL(batch.fileUrl);
          const pathRegex = /o\/(.+?)\?/;
          const match = urlObj.pathname.match(pathRegex);
          if (match && match[1]) {
            const decodedPath = decodeURIComponent(match[1]);
            const fileRef = ref(storage, decodedPath);
            await deleteObject(fileRef);
          }
        } catch (storageErr) {
          console.error("Failed to delete file from storage:", storageErr);
          // We continue even if storage deletion fails, as the DB record is gone
        }
      }
      setSuccessMsg('Batch deleted successfully.');
    } catch (err) {
      console.error("Error deleting batch:", err);
      setErrorMsg('Failed to delete batch.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 800000) { // 800KB limit for Base64
        setErrorMsg("Logo file too large. Please use an image under 800KB.");
        return;
      }

      setIsUploadingLogo(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64String = event.target?.result as string;
          await setDoc(doc(db, 'settings', 'appearance'), {
            logoUrl: base64String,
            updatedAt: serverTimestamp()
          }, { merge: true });
          setLogoUrl(base64String);
          setSuccessMsg("Logo updated successfully!");
        } catch (err: any) {
          setErrorMsg("Failed to update logo: " + err.message);
        } finally {
          setIsUploadingLogo(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = (batch: DataBatch) => {
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
    } else {
      alert("No file content or URL found for this batch.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Main Admin Panel</h1>
        <Link 
          to="/uma-blog-admin-786" 
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20"
        >
          <BookOpen className="w-5 h-5" />
          Manage Blogs
        </Link>
      </div>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Upload Form */}
        <div className="space-y-8">
          {/* Logo Management Section */}
          <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ImagePlus className="w-5 h-5 text-blue-500" />
              Site Logo
            </h2>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-black border border-gray-800 flex items-center justify-center overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="Current Logo" className="w-full h-full object-contain" />
                ) : (
                  <Database className="w-8 h-8 text-gray-700" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isUploadingLogo}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Change Logo
                </button>
                <p className="text-xs text-gray-500 mt-2">Recommended: Square PNG/SVG under 500KB</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Hinglish Medical QA Dataset"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Describe the dataset..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Category</label>
                  <input
                    required
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Medical, Tech, General"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">QA Count (Manual)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.qaCount}
                    onChange={(e) => setFormData({...formData, qaCount: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Hero Switch */}
              <div className="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-xl">
                <div>
                  <p className="font-medium text-white">Send to Hero Section</p>
                  <p className="text-sm text-gray-500">Mark this as Pro Data to show in the top hero box.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={formData.isHero}
                    onChange={(e) => setFormData({...formData, isHero: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Upload File (.json, .txt)</label>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className={cn(
                      "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
                      file ? "border-blue-500 bg-blue-500/5" : "border-gray-700 hover:border-gray-500 hover:bg-gray-800/50"
                    )}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {file ? (
                        <>
                          <FileJson className="w-8 h-8 text-blue-500 mb-2" />
                          <p className="text-sm text-white font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-500 mb-2" />
                          <p className="text-sm text-gray-400">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500">JSON or TXT files only</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Status Messages */}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading... {Math.round(uploadProgress)}%
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload Data Batch
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Featured Video Section */}
          <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 shadow-2xl mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-500/10 rounded-2xl">
                <Youtube className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Featured Video Popup</h2>
                <p className="text-sm text-gray-400">Show a YouTube video popup to users</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">YouTube Video URL</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-gray-500 italic">Leave empty to disable the popup</p>
              </div>

              <button
                onClick={handleSaveVideo}
                disabled={isSavingVideo}
                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSavingVideo ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                Save Video Settings
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Manage Uploads */}
        <div>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Manage Data</h2>
            <p className="text-gray-400">View and delete uploaded batches.</p>
          </div>

          <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 shadow-2xl max-h-[800px] overflow-y-auto">
            {batches.length === 0 ? (
              <div className="text-center py-12">
                <Database className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">No data batches uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {batches.map((batch) => (
                  <div key={batch.id} className="bg-black border border-gray-800 rounded-xl p-4 flex items-center justify-between group hover:border-gray-700 transition-colors">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-200 truncate">{batch.title}</h3>
                        {batch.isHero && (
                          <span className="bg-yellow-500/20 text-yellow-500 text-[10px] px-2 py-0.5 rounded uppercase font-bold">Hero</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{batch.fileName}</p>
                      <div className="flex gap-3 mt-2 text-xs text-gray-400 font-mono">
                        <span>QA: {batch.qaCount}</span>
                        <span>Lines: {batch.linesCount}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(batch)}
                        className="p-3 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"
                        title="Download Data"
                      >
                        <Upload className="w-5 h-5 rotate-180" />
                      </button>
                      <button
                        onClick={() => handleDelete(batch)}
                        disabled={isDeleting === batch.id}
                        className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors disabled:opacity-50"
                        title="Delete Batch"
                      >
                        {isDeleting === batch.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
