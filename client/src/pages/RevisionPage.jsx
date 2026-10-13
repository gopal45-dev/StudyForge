import React, { useEffect, useState } from 'react';
import api from '../api/client';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  Calendar,
  Layers,
} from 'lucide-react';

export default function RevisionPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [recMessage, setRecMessage] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/revision-tasks');
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleGenerateRecommendations = async () => {
    try {
      setGenerating(true);
      const res = await api.post('/revision-tasks/generate-recommendations');
      if (res.data.success) {
        setRecMessage(res.data.message);
        setTimeout(() => setRecMessage(null), 3500);
        fetchTasks();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await api.patch(`/revision-tasks/${task._id}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/revision-tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Revision Planner</h1>
          <p className="text-sm text-slate-500 mt-1">
            Prioritized tasks automatically targeted to close knowledge gaps based on your quiz mistakes.
          </p>
        </div>

        <button
          onClick={handleGenerateRecommendations}
          disabled={generating}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all text-sm disabled:opacity-60"
        >
          <Sparkles className="w-4 h-4" />
          <span>{generating ? 'Analyzing Mistakes...' : 'Auto-Generate Tasks'}</span>
        </button>
      </div>

      {recMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-semibold text-center animate-in fade-in">
          {recMessage}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading revision schedule...</div>
      ) : tasks.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
          <Layers className="w-10 h-10 text-brand-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Revision Tasks Scheduled</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Take practice assessments on your uploaded lecture notes. When your accuracy drops below threshold (&lt;65%), the planner will detect weak topics and propose revision items.
          </p>
          <button
            onClick={handleGenerateRecommendations}
            className="mt-2 px-4 py-2 bg-brand-50 text-brand-700 border border-brand-200 font-semibold rounded-xl text-xs hover:bg-brand-100"
          >
            Check Analytics For Recommendations
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                task.status === 'COMPLETED'
                  ? 'bg-slate-50 border-slate-200 opacity-70'
                  : 'bg-white border-slate-200/80 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <button
                  onClick={() => handleToggleStatus(task)}
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    task.status === 'COMPLETED'
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 hover:border-brand-500'
                  }`}
                >
                  {task.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`font-semibold text-sm ${
                        task.status === 'COMPLETED'
                          ? 'line-through text-slate-400'
                          : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </h4>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        task.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-700'
                          : task.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">{task.description}</p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>Topic: {task.topicTag}</span>
                    <span>&bull;</span>
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDeleteTask(task._id)}
                className="text-slate-300 hover:text-rose-600 p-1"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
