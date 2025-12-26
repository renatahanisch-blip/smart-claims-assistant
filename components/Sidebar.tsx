import React from 'react';
import { LayoutDashboard, Inbox, CheckCircle, Settings, ShieldAlert } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <div className="w-16 md:w-64 bg-slate-900 text-white flex flex-col h-screen transition-all duration-300">
      <div className="p-4 flex items-center justify-center md:justify-start space-x-2 border-b border-slate-700">
        <ShieldAlert className="w-8 h-8 text-indigo-400" />
        <span className="text-xl font-bold hidden md:block">REMAlino</span>
      </div>

      <nav className="flex-1 py-6 space-y-2">
        <NavItem icon={<Inbox />} label="Schaden Posteingang" active />
        <NavItem icon={<CheckCircle />} label="Erledigt" />
        <NavItem icon={<LayoutDashboard />} label="Analysen" />
      </nav>

      <div className="p-4 border-t border-slate-700">
        <NavItem icon={<Settings />} label="Einstellungen" />
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active }) => (
  <button
    className={`w-full flex items-center p-3 transition-colors ${
      active
        ? 'bg-indigo-600 text-white border-r-4 border-indigo-400'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <span className="mx-auto md:mx-0">{icon}</span>
    <span className="ml-3 hidden md:block font-medium">{label}</span>
  </button>
);