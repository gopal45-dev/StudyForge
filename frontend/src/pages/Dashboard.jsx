import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  FolderPlus,
  ArrowRight,
  Brain,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">
        <div className="animate-pulse space-y-4 max-w-md mx-auto">
          <div className="h-8 bg-slate-200 rounded w-2/3 mx-auto"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    subjectCount: 0,
    documentCount: 0,
    attemptsCount: 0,
    pendingTasks: 0,
    overallAccuracy: 0,
  };

  const weakTopics = data?.weakTopics || [];
  const insufficientEvidence = data?.insufficientEvidenceTopics || [];
  const recentAttempts = data?.recentAttempts || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Learning Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Empirical topic accuracy and active revision planner.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/subjects"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Manage Subjects</span>
          </Link>
          <Link
            to="/revision"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Revision Tasks</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Subjects</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900">{metrics.subjectCount}</span>
            <BookOpen className="w-5 h-5 text-brand-500" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Processed Notes</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900">{metrics.documentCount}</span>
            <Brain className="w-5 h-5 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quiz Accuracy</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900">{metrics.overallAccuracy}%</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Revisions</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900">{metrics.pendingTasks}</span>
            <Calendar className="w-5 h-5 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Grid: Weak Topics & Recent Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Weak Topics & Attention Areas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>Empirical Weak Topics</span>
              </h2>
              <span className="text-xs bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full font-semibold border border-rose-100">
                &ge; 3 questions tested
              </span>
            </div>

            {weakTopics.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No critical weak topics detected!</p>
                <p className="text-xs text-slate-400 mt-1">
                  Keep attempting quizzes across your lecture notes to gather empirical performance data.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {weakTopics.map((topic, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{topic.topicTag}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Sample size: {topic.attemptedCount} attempts &bull; Accuracy: {topic.accuracy}%
                      </p>
                    </div>
                    <Link
                      to="/revision"
                      className="text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Create Task</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Insufficient Data Topics */}
          {insufficientEvidence.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <span>Insufficient Evidence Areas (&lt; 3 questions attempted)</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {insufficientEvidence.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200"
                  >
                    {t.topicTag} ({t.attemptedCount} attempts)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Recent Quiz Attempts */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Quiz History</h2>
            {recentAttempts.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
                No quiz attempts yet. Generate an assessment from your uploaded notes!
              </div>
            ) : (
              <div className="space-y-3">
                {recentAttempts.map((attempt) => (
                  <div
                    key={attempt._id}
                    className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-500">
                        {new Date(attempt.createdAt).toLocaleDateString()}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          attempt.scorePercentage >= 70
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {attempt.scorePercentage}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      {attempt.correctCount} correct &bull; {attempt.incorrectCount} mistakes &bull;{' '}
                      {attempt.skippedCount} skipped
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
