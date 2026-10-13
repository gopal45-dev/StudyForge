import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  BarChart3,
  LogOut,
  BrainCircuit,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="bg-brand-600 text-white p-2 rounded-xl shadow-sm">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            Study<span className="text-brand-600">Forge</span>
          </span>
        </Link>

        {user ? (
          <nav className="flex items-center space-x-1 sm:space-x-3">
            <Link
              to="/dashboard"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/subjects"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <FolderKanban className="w-4 h-4" />
              <span>Subjects</span>
            </Link>

            <Link
              to="/revision"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Revision Planner</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 mx-2" />

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full border border-brand-200">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </nav>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center space-x-1.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Get Started</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
