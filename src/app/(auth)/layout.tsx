import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4 selection:bg-[#39FF14] selection:text-black">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#39FF14]/30 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#39FF14] shadow-[0_0_12px_#39FF14]" />
            </div>
            <span className="text-2xl font-bold tracking-wider text-white">OPAL</span>
          </div>
          <span className="text-xs uppercase tracking-widest text-[#a3a3a3]">
            The Trading Operating System
          </span>
        </div>
        <div className="bg-[#141414] border border-white/10 rounded-xl p-8 shadow-2xl backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
