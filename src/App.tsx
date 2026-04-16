/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import AdminPanel from './pages/AdminPanel';
import About from './pages/About';
import Blogs from './pages/Blogs';
import BlogPost from './pages/BlogPost';
import BlogAdmin from './pages/BlogAdmin';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/uma-hidden-786" element={<AdminPanel />} />
        <Route path="/uma-blog-admin-786" element={<BlogAdmin />} />
      </Routes>
    </Router>
  );
}
