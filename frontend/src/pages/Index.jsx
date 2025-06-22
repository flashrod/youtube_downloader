import React, { useState } from "react";
import { DownloaderForm } from "../DownloaderForm";
import { ThemeToggle } from "../components/ThemeToggle";
import { Youtube } from 'lucide-react';

const Index = () => {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className={`min-h-screen transition-all duration-1000 ${theme === "dark" ? "dark" : ""}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className={`absolute inset-0 transition-all duration-1000 ${
          theme === "light" 
            ? "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" 
            : "bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900"
        }`} />
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-r from-yellow-400 to-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 animate-slide-in-up">
              <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-xl animate-pulse-glow">
                <Youtube className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                  YouTube Downloader
                </h1>
                <p className="text-sm text-muted-foreground font-medium tracking-wider uppercase">
                  Ultra Fast • High Quality • Free Forever
                </p>
              </div>
            </div>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-6xl font-black leading-tight">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent animate-gradient">
                  Download
                </span>
                <br />
                <span className="text-foreground">Any Video</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Paste your YouTube URL below, choose your preferred format, and download instantly with blazing speed.
              </p>
            </div>

            {/* Download Form */}
            <div className="animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
              <DownloaderForm />
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
              {[
                { title: "Lightning Fast", desc: "Download at maximum speed with our optimized servers", icon: "⚡" },
                { title: "High Quality", desc: "Get videos in up to 4K resolution with crystal clear audio", icon: "🎯" },
                { title: "100% Free", desc: "No limits, no registration, no hidden fees. Forever.", icon: "💎" }
              ].map((feature, index) => (
                <div key={index} className="glassmorphism p-6 rounded-2xl hover:scale-105 transition-all duration-300 group">
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Support</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 YouTube Downloader. Crafted with ❤️ and cutting-edge technology.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;