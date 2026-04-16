import React from 'react';
import { motion } from 'motion/react';
import { Database, Target, Zap, Shield, Globe, MessageCircle, Mail, ArrowLeft, Linkedin, Youtube, Instagram } from 'lucide-react';
import Header from '../components/Header';

export default function About() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Decoding Logic for the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Next Billion
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
            Zendata isn't just a database—it's an Open-Source Movement. We don't believe in generic internet scraping; we believe in teaching AI models the true 'Indian Reality' and 'Tactical Logic'.
          </p>
        </motion.div>

        {/* Mission Section */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
                Our Mission
              </div>
              <h2 className="text-3xl font-bold">Quality Over Noise</h2>
              <p className="text-gray-400 leading-relaxed">
                Today, 'Junk Data' is being sold for AI training at exorbitant prices (₹30-40 per QA). Zendata is changing that. We provide High-Strike Logic datasets that move models beyond pattern-matching toward true reasoning and scenario-handling.
              </p>
            </div>
            <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors"></div>
              <Target className="w-12 h-12 text-blue-500 mb-6" />
              <h3 className="text-xl font-bold mb-4 text-gray-100">Tactical Reasoning</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                We focus on datasets that challenge AI to think, not just predict the next token.
              </p>
            </div>
          </div>
        </section>

        {/* The Zendata Difference */}
        <section className="mb-32">
          <h2 className="text-3xl font-bold mb-12 text-center">The Zendata Difference</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-blue-400" />}
              title="Hinglish Nuances"
              description="Our data speaks the language of real India, capturing the unique blend of Hindi and English."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-yellow-400" />}
              title="Scenario-Based Mining"
              description="Hand-mined batches designed to tackle legal, corporate, and social disputes."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-green-400" />}
              title="Zero Friction"
              description="No login, No sign-up. Just pure, unrestricted data access for everyone."
            />
          </div>
        </section>

        {/* Commercial Freedom */}
        <section className="mb-32 bg-gradient-to-b from-blue-600/5 to-transparent border border-blue-500/10 rounded-3xl p-8 md:p-12">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Commercial Freedom</h2>
            <p className="text-gray-400">
              We believe innovation should have no barriers. Our license gives you the full freedom to build and deploy.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-left">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <p className="text-sm text-gray-300">100% Free & Open Source</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <p className="text-sm text-gray-300">Commercial Use Safe</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <p className="text-sm text-gray-300">No Attribution Required</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <p className="text-sm text-gray-300">Deploy without Hassle</p>
              </div>
            </div>
          </div>
        </section>

        {/* Custom Datasets */}
        <section className="mb-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Need More Intelligence?</h2>
            <p className="text-gray-400">For larger requirements, we provide Tailored Datasets.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 hover:border-blue-500/50 transition-colors">
              <h3 className="text-xl font-bold mb-2">Startup Pack</h3>
              <p className="text-blue-400 font-mono text-sm mb-4">100 – 3,000 QA Pairs</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Custom logic and scenarios built specifically for your niche and target audience.
              </p>
            </div>
            <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 hover:border-purple-500/50 transition-colors">
              <h3 className="text-xl font-bold mb-2">Enterprise Deal</h3>
              <p className="text-purple-400 font-mono text-sm mb-4">1 Lakh+ QA Pairs</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                High-scale, high-strike logic data for foundation models and large-scale fine-tuning.
              </p>
            </div>
          </div>
        </section>

        {/* Founder Quote */}
        <section className="mb-32 text-center">
          <div className="inline-block mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 mx-auto">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden">
                <span className="text-2xl font-bold text-blue-400">MU</span>
              </div>
            </div>
          </div>
          <blockquote className="text-2xl md:text-3xl font-medium italic text-gray-200 mb-8">
            "Zendata is built on the belief that high-quality intelligence shouldn't be a luxury. It should be the foundation."
          </blockquote>
          <div className="text-gray-400">
            <p className="font-bold text-white">MD Umair</p>
            <p className="text-sm">Founder, Zendata Hub</p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="border-t border-gray-800 pt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-gray-400">Have questions or custom requirements? Reach out to us.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <a 
              href="https://wa.me/919520699063" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-4 p-6 bg-[#111] border border-gray-800 rounded-2xl hover:border-green-500/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <MessageCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">WhatsApp</p>
                <p className="text-lg font-bold">+91 9520699063</p>
              </div>
            </a>
            <a 
              href="mailto:zendataofficial@gmail.com" 
              className="flex items-center gap-4 p-6 bg-[#111] border border-gray-800 rounded-2xl hover:border-blue-500/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Mail className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Email</p>
                <p className="text-lg font-bold">zendataofficial@gmail.com</p>
              </div>
            </a>
          </div>

          <div className="flex justify-center gap-6 mt-12">
            <SocialLink href="https://linkedin.com/in/md-umair-241972393" icon={<Linkedin className="w-5 h-5" />} color="hover:text-blue-400" />
            <SocialLink href="https://youtube.com/@zendataofficial" icon={<Youtube className="w-5 h-5" />} color="hover:text-red-500" />
            <SocialLink href="https://instagram.com/zendatahub" icon={<Instagram className="w-5 h-5" />} color="hover:text-pink-500" />
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-gray-800/50 text-center">
        <p className="text-gray-600 text-sm font-mono">
          © {new Date().getFullYear()} Zendata Hub. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-black border border-gray-800 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-3 text-gray-100">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function SocialLink({ href, icon, color }: { href: string, icon: React.ReactNode, color: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer"
      className={`w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 transition-all ${color} hover:border-current`}
    >
      {icon}
    </a>
  );
}
