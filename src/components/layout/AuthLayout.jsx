import React from 'react';
import { Outlet } from 'react-router-dom';
import { Command } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient gradient orbs */}
      <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-500/[0.07] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-violet-500/[0.05] blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center animate-fade-in-up">
        <div className="flex items-center space-x-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Command className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">FinDash</h1>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-fade-in-up stagger-2">
        <div className="glass-card py-8 px-4 sm:rounded-2xl sm:px-10 noise-overlay relative">
          <div className="relative z-10">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
