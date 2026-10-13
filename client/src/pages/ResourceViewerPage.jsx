import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import {
  Brain,
  RotateCw,
  CheckCircle2,
  ThumbsUp,
  Flame,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function ResourceViewerPage() {
  const { resourceId } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  // Flashcards state
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/resources/${resourceId}`);
        if (res.data.success) {
          setResource(res.data.data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [resourceId]);

  const handleReviewRating = async (rating) => {
    const cards = resource?.structuredContent?.cards || [];
    const currentCard = cards[currentCardIdx];
    if (!currentCard) return;

    try {
      await api.post(`/resources/${resourceId}/reviews`, {
        cardId: currentCard.id,
        rating,
      });
      setFeedbackSuccess(`Rating "${rating}" saved to Spaced-Repetition schedule!`);
      setTimeout(() => setFeedbackSuccess(null), 2500);

      // Advance to next card
      if (currentCardIdx < cards.length - 1) {
        setCurrentCardIdx((prev) => prev + 1);
        setIsFlipped(false);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading || !resource) {
    return <div className="p-12 text-center text-slate-400">Loading study resource...</div>;
  }

  const isSummary = resource.resourceType === 'SUMMARY';
  const content = resource.structuredContent;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to={`/subjects/${resource.subjectId?._id || ''}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Subject</span>
        </Link>
        <span className="text-xs font-bold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full border border-brand-200 uppercase tracking-wider">
          {resource.resourceType}
        </span>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{resource.title}</h1>
        <p className="text-xs text-slate-400 mt-1">
          Source Document: {resource.documentId?.originalName || 'Notes'}
        </p>
      </div>

      {/* SUMMARY DISPLAY */}
      {isSummary && (
        <div className="space-y-6">
          {/* Overview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
              Executive Overview
            </h3>
            <p className="text-slate-700 leading-relaxed text-sm">{content.overview}</p>
          </div>

          {/* Key Concepts */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Core Learning Points
            </h3>
            <ul className="space-y-2">
              {content.keyPoints?.map((pt, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-2 flex-shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Term Definitions */}
          {content.definitions?.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Key Terminology & Definitions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.definitions.map((def, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                    <div className="font-semibold text-slate-900 text-sm mb-1">{def.term}</div>
                    <div className="text-xs text-slate-600 leading-normal">{def.definition}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FLASHCARDS DISPLAY (Spaced Repetition Interactive Deck) */}
      {!isSummary && (
        <div className="space-y-6">
          {feedbackSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold text-center animate-in fade-in">
              {feedbackSuccess}
            </div>
          )}

          {content.cards && content.cards.length > 0 ? (
            <div className="space-y-6">
              {/* Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer min-h-[260px] bg-white border border-slate-200/80 hover:border-brand-300 rounded-3xl p-8 shadow-sm flex flex-col justify-between transition-all select-none"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold uppercase tracking-wider">
                    Card {currentCardIdx + 1} of {content.cards.length}
                  </span>
                  <span className="px-2.5 py-0.5 bg-slate-100 rounded-md font-semibold text-slate-600">
                    {content.cards[currentCardIdx].topicTag}
                  </span>
                </div>

                <div className="my-8 text-center">
                  <div className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
                    {isFlipped ? 'ANSWER' : 'QUESTION (Click to flip)'}
                  </div>
                  <div className="text-lg font-semibold text-slate-900 leading-snug">
                    {isFlipped
                      ? content.cards[currentCardIdx].back
                      : content.cards[currentCardIdx].front}
                  </div>
                </div>

                <div className="text-center text-xs text-slate-400">
                  Tap anywhere on card to {isFlipped ? 'show front' : 'reveal answer'}
                </div>
              </div>

              {/* Spaced Repetition Rating Buttons */}
              {isFlipped && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="text-center text-xs font-semibold text-slate-500">
                    Rate Recall Quality (Spaced-Repetition Scheduling):
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleReviewRating('AGAIN')}
                      className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
                    >
                      Again (+1d)
                    </button>
                    <button
                      onClick={() => handleReviewRating('HARD')}
                      className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-colors"
                    >
                      Hard (+2d)
                    </button>
                    <button
                      onClick={() => handleReviewRating('GOOD')}
                      className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
                    >
                      Good (+4d)
                    </button>
                    <button
                      onClick={() => handleReviewRating('EASY')}
                      className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors"
                    >
                      Easy (+7d)
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Arrows */}
              <div className="flex items-center justify-between">
                <button
                  disabled={currentCardIdx === 0}
                  onClick={() => {
                    setCurrentCardIdx((prev) => prev - 1);
                    setIsFlipped(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xs font-semibold flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  disabled={currentCardIdx === content.cards.length - 1}
                  onClick={() => {
                    setCurrentCardIdx((prev) => prev + 1);
                    setIsFlipped(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xs font-semibold flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border">
              No flashcards found in this resource.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
