import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

export default function QuizTakePage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: selectedOptionIndex }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Result state after submission
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/quizzes/${quizId}`);
        if (res.data.success) {
          setQuiz(res.data.data);
        }
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (!quiz || result) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [quiz, result]);

  const handleSelectOption = (questionId, optionIndex) => {
    if (result) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!window.confirm('Ready to submit your assessment answers for server scoring?')) return;
    try {
      setSubmitting(true);
      const payloadAnswers = quiz.questions.map((q) => ({
        questionId: q.id,
        selectedIndex: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
      }));

      const res = await api.post(`/quizzes/${quizId}/attempts`, {
        answers: payloadAnswers,
        timeSpentSeconds: timerSeconds,
      });

      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !quiz) {
    return <div className="p-12 text-center text-slate-400">Loading quiz questions...</div>;
  }

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Quiz Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between sticky top-20 z-20 backdrop-blur-md bg-white/95">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{quiz.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Subject: {quiz.subjectId?.name || 'General'} &bull; {quiz.questions.length} Questions
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 rounded-xl text-slate-700">
            <Clock className="w-4 h-4 text-brand-600" />
            <span>{formatTimer(timerSeconds)}</span>
          </div>

          {!result && (
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-60"
            >
              {submitting ? 'Scoring...' : 'Submit Assessment'}
            </button>
          )}
        </div>
      </div>

      {/* Results Banner (Post-submission) */}
      {result && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Assessment Completed & Evaluated
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                Score: {result.scorePercentage}%
              </h2>
            </div>
            <div className="flex gap-3 text-xs font-semibold">
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                {result.correctCount} Correct
              </span>
              <span className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-100">
                {result.incorrectCount} Mistakes
              </span>
              <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl">
                {result.skippedCount} Skipped
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Mistake metrics have been automatically recorded into your topic analytics and feeds your Revision Planner.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-xs font-medium bg-brand-600 text-white rounded-xl hover:bg-brand-700"
            >
              View Updated Dashboard
            </button>
            <button
              onClick={() => navigate('/revision')}
              className="px-4 py-2 text-xs font-medium bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200"
            >
              Check Revision Tasks
            </button>
          </div>
        </div>
      )}

      {/* Question Cards */}
      <div className="space-y-6">
        {quiz.questions.map((q, idx) => {
          const evalResult = result?.responses?.find((r) => r.questionId === q.id);

          return (
            <div
              key={q.id}
              className={`bg-white p-6 rounded-2xl border transition-all ${
                result
                  ? evalResult?.isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200 bg-rose-50/20'
                  : 'border-slate-200/80 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <span className="text-xs font-bold text-slate-400">Question {idx + 1}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {q.topicTag}
                </span>
              </div>

              <h3 className="text-base font-semibold text-slate-900 mb-4">{q.question}</h3>

              {/* Options */}
              <div className="space-y-2.5">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[q.id] === optIdx;
                  let optStyle =
                    'border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-slate-800';

                  if (!result && isSelected) {
                    optStyle = 'border-brand-600 bg-brand-50/60 text-brand-900 font-semibold ring-1 ring-brand-600';
                  }

                  if (result) {
                    if (optIdx === evalResult?.correctIndex) {
                      optStyle = 'border-emerald-500 bg-emerald-100 text-emerald-900 font-bold';
                    } else if (isSelected && !evalResult?.isCorrect) {
                      optStyle = 'border-rose-400 bg-rose-100 text-rose-900 font-medium';
                    } else {
                      optStyle = 'border-slate-200 bg-slate-50 opacity-60 text-slate-600';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={Boolean(result)}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`w-full p-3.5 rounded-xl border text-sm text-left transition-all flex items-center justify-between ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {result && optIdx === evalResult?.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Answer Explanation Box (Shown after submission) */}
              {result && evalResult && (
                <div className="mt-4 pt-3 border-t border-slate-200/80 text-xs space-y-1">
                  <div className="font-semibold text-slate-700">Official Explanation:</div>
                  <div className="text-slate-600 leading-relaxed">{evalResult.explanation}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
