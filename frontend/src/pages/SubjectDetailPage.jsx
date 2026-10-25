import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import {
  UploadCloud,
  FileText,
  Sparkles,
  BookOpen,
  Brain,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Trash2,
  RotateCw,
  ArrowRight,
} from 'lucide-react';

export default function SubjectDetailPage() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [resources, setResources] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(null); // documentId currently generating

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes, docRes, resRes, quizRes] = await Promise.all([
        api.get(`/subjects/${subjectId}`),
        api.get(`/subjects/${subjectId}/documents`),
        api.get(`/resources?subjectId=${subjectId}`),
        api.get(`/quizzes?subjectId=${subjectId}`),
      ]);
      setSubject(subRes.data.data);
      setDocuments(docRes.data.data);
      setResources(resRes.data.data);
      setQuizzes(quizRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subjectId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      await api.post(`/subjects/${subjectId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchData();
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async (docId, type) => {
    try {
      setGenerating(`${docId}-${type}`);
      let endpoint = '';
      if (type === 'summary') endpoint = `/documents/${docId}/generate-summary`;
      if (type === 'flashcards') endpoint = `/documents/${docId}/generate-flashcards`;
      if (type === 'quiz') endpoint = `/documents/${docId}/generate-quiz`;

      await api.post(endpoint);
      fetchData();
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setGenerating(null);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Delete this uploaded document? Associated quizzes and flashcards will also be removed.')) return;
    try {
      await api.delete(`/documents/${docId}`);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Delete this practice quiz?')) return;
    try {
      await api.delete(`/quizzes/${quizId}`);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Delete this study resource?')) return;
    try {
      await api.delete(`/resources/${resourceId}`);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading || !subject) {
    return <div className="p-12 text-center text-slate-400">Loading subject workspace...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Subject Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: subject.colorCode || '#4f46e5' }}
            />
            <h1 className="text-2xl font-bold text-slate-900">{subject.name}</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">{subject.description || 'No description provided.'}</p>
        </div>

        {/* Upload Button */}
        <div>
          <label className="cursor-pointer inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all text-sm">
            <UploadCloud className="w-4 h-4" />
            <span>{uploading ? 'Processing File...' : 'Upload Notes (PDF/TXT)'}</span>
            <input
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              disabled={uploading}
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Grid: Documents list & Generated Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Uploaded Documents */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            <span>Uploaded Course Materials</span>
          </h2>

          {documents.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-200 text-center text-sm text-slate-500">
              Upload a lecture slide PDF or textbook chapter notes to extract text and generate study assets.
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{doc.originalName}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span>{(doc.size / 1024).toFixed(1)} KB</span>
                        <span>&bull;</span>
                        <span
                          className={`font-medium ${
                            doc.processingStatus === 'PROCESSED'
                              ? 'text-emerald-600'
                              : doc.processingStatus === 'FAILED'
                              ? 'text-rose-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {doc.processingStatus}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDoc(doc._id)}
                      className="text-slate-300 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {doc.processingStatus === 'FAILED' && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{doc.processingError}</span>
                    </div>
                  )}

                  {doc.processingStatus === 'PROCESSED' && (() => {
                    const existingSummary = resources.find(
                      (r) => r.resourceType === 'SUMMARY' && (r.documentId?._id === doc._id || r.documentId === doc._id)
                    );
                    const existingFlashcards = resources.find(
                      (r) => r.resourceType === 'FLASHCARDS' && (r.documentId?._id === doc._id || r.documentId === doc._id)
                    );
                    const existingQuiz = quizzes.find(
                      (q) => q.documentId?._id === doc._id || q.documentId === doc._id
                    );

                    return (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                        {existingSummary ? (
                          <Link
                            to={`/resources/${existingSummary._id}`}
                            className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>View Summary</span>
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleGenerate(doc._id, 'summary')}
                            disabled={generating === `${doc._id}-summary`}
                            className="px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-700 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                            <span>{generating === `${doc._id}-summary` ? 'Generating...' : 'Summary'}</span>
                          </button>
                        )}

                        {existingFlashcards ? (
                          <Link
                            to={`/resources/${existingFlashcards._id}`}
                            className="px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>View Flashcards</span>
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleGenerate(doc._id, 'flashcards')}
                            disabled={generating === `${doc._id}-flashcards`}
                            className="px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-700 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <Brain className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{generating === `${doc._id}-flashcards` ? 'Generating...' : 'Flashcards'}</span>
                          </button>
                        )}

                        {existingQuiz ? (
                          <Link
                            to={`/quiz/${existingQuiz._id}`}
                            className="px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                            <span>Take Quiz</span>
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleGenerate(doc._id, 'quiz')}
                            disabled={generating === `${doc._id}-quiz`}
                            className="px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-700 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{generating === `${doc._id}-quiz` ? 'Generating...' : 'Create Quiz'}</span>
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Generated Study Resources & Quizzes */}
        <div className="space-y-6">
          {/* Active Quizzes */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-emerald-600" />
              <span>Generated Practice Assessments</span>
            </h2>

            {quizzes.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500 text-center">
                No quizzes generated for this subject yet. Click "Create Quiz" on any processed document.
              </div>
            ) : (
              <div className="space-y-3">
                {quizzes.map((q) => (
                  <div
                    key={q._id}
                    className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{q.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {q.questions?.length || 4} questions &bull; Multi-choice assessment
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/quiz/${q._id}`}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium shadow-sm flex items-center gap-1.5 transition-colors"
                      >
                        <span>Take Quiz</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteQuiz(q._id)}
                        className="p-2 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete quiz"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Generated Summaries & Flashcards */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-indigo-600" />
              <span>Grounded Summaries & Flashcards</span>
            </h2>

            {resources.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500 text-center">
                Generate summaries and flashcard decks from your course notes.
              </div>
            ) : (
              <div className="space-y-3">
                {resources.map((res) => (
                  <div
                    key={res._id}
                    className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                        {res.resourceType}
                      </span>
                      <h4 className="font-semibold text-slate-900 text-sm mt-1">{res.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/resources/${res._id}`}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteResource(res._id)}
                        className="p-2 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
