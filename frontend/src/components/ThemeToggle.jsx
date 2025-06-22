import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ThemeToggle = ({ theme, onToggle }) => {
  return (
    <Button
      onClick={onToggle}
      variant="outline"
      size="lg"
      className="relative overflow-hidden group glassmorphism border-white/20 hover:border-white/40 transition-all duration-300"
    >
      <div className="flex items-center space-x-2">
        <div className="relative">
          {theme === "light" ? (
            <Sun className="w-5 h-5 text-yellow-500 transition-all duration-300 group-hover:rotate-180" />
          ) : (
            <Moon className="w-5 h-5 text-blue-400 transition-all duration-300 group-hover:rotate-12" />
          )}
        </div>
        <span className="font-medium">
          {theme === "light" ? "Dark" : "Light"}
        </span>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Button>
  );
};