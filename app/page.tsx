"use client";

import { supabase } from '@/lib/supabase'
import { useState, useEffect } from "react";

const subjects = [
  { id: "pediatric", name: "Pediatric Nursing", icon: "👶" },
  { id: "medsurg", name: "Med-Surgical Nursing", icon: "🏥" },
  { id: "mentalhealth", name: "Mental Health Nursing", icon: "🧠" },
  { id: "community", name: "Community Health Nursing", icon: "🏘️" },
  { id: "obgyn", name: "OB/GYN Nursing", icon: "🤰" },
  { id: "anatomy", name: "Anatomy & Physiology", icon: "🫀" },
  { id: "psychology", name: "Psychology", icon: "💭" },
  { id: "nutrition", name: "Nutrition & Biochemistry", icon: "🥗" },
  { id: "microbiology", name: "Microbiology/Infection Control", icon: "" },
];

export default function NursingApp() {
  const [questionBank, setQuestionBank] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"home" | "subject" | "quiz" | "mock" | "results">("home");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentQuestions, setCurrentQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showRationale, setShowRationale] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attemptedQuestions, setAttemptedQuestions] = useState<Set<number>>(new Set());
  const [mockTestQuestions, setMockTestQuestions] = useState<any[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const [mockTestStarted, setMockTestStarted] = useState(false);
  const [mockTestSubmitted, setMockTestSubmitted] = useState(false);
  const [mockTestAnswers, setMockTestAnswers] = useState<Record<number, string[]>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string[]>>({});

  // Debug: Track component state
  useEffect(() => {
    console.log('🔄 Component mounted/updated');
    console.log('📊 loading:', loading);
    console.log('📊 currentView:', currentView);
    console.log('📊 questionBank length:', questionBank.length);
    
    return () => {
      console.log('🔴 Component UNMOUNTING');
    };
  }, [loading, currentView, questionBank.length]);

  // Fetch questions from Supabase
  useEffect(() => {
    const fetchQuestions = async () => {
      console.log('Starting to fetch questions...')
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
        
        console.log('Supabase response:', { data, error })
        
        if (error) {
          console.error('Error fetching questions:', error)
          setLoading(false)
          return
        }
        
        const formattedQuestions = data.map((q: any) => ({
          id: q.id,
          category: q.category,
          categoryName: q.categoryName,
          type: 'MCQ',
          stem: q.stem,
          options: [
            { id: 'A', text: q.option_a, isCorrect: q.correct_answer === 'A' },
            { id: 'B', text: q.option_b, isCorrect: q.correct_answer === 'B' },
            { id: 'C', text: q.option_c, isCorrect: q.correct_answer === 'C' },
            { id: 'D', text: q.option_d, isCorrect: q.correct_answer === 'D' },
          ],
          rationale: q.rationale,
        }))
        
        console.log('Formatted questions:', formattedQuestions)
        setQuestionBank(formattedQuestions)
        setLoading(false)
      } catch (error) {
        console.error('Error:', error)
        setLoading(false)
      }
    }
    
    fetchQuestions()
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mockTestStarted && !mockTestSubmitted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && mockTestStarted && !mockTestSubmitted) {
      handleSubmitMockTest();
    }
    return () => clearInterval(timer);
  }, [mockTestStarted, mockTestSubmitted, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startSubjectQuiz = (categoryId: string) => {
    console.log('🎯 Starting quiz for category:', categoryId);
    const categoryQuestions = questionBank.filter((q) => q.category === categoryId);
    setCurrentQuestions(categoryQuestions);
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setShowRationale(false);
    setIsCorrect(null);
    setAttemptedQuestions(new Set());
    setQuizAnswers({});
    setCurrentView("quiz");
  };

  const startMockTest = () => {
    console.log('🎯 Starting mock test');
    const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 50);
    setMockTestQuestions(selected);
    setCurrentQuestions(selected);
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setShowRationale(false);
    setIsCorrect(null);
    setAttemptedQuestions(new Set());
    setMockTestAnswers({});
    setTimeRemaining(1800);
    setMockTestStarted(true);
    setMockTestSubmitted(false);
    setCurrentView("mock");
  };

  const handleSelect = (optionId: string) => {
    const isSATA = currentQuestions[currentIndex].type === "SATA";
    let newAnswers: string[];
    if (isSATA) {
      newAnswers = selectedAnswers.includes(optionId)
        ? selectedAnswers.filter((id) => id !== optionId)
        : [...selectedAnswers, optionId];
    } else {
      newAnswers = [optionId];
    }
    setSelectedAnswers(newAnswers);
    if (currentView === "mock") {
      setMockTestAnswers((prev) => ({ ...prev, [currentIndex]: newAnswers }));
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswers.length === 0) return;
    const currentQuestion = currentQuestions[currentIndex];
    const correctIds = currentQuestion.options.filter((opt: any) => opt.isCorrect).map((opt: any) => opt.id);
    const isAnswerCorrect = selectedAnswers.length === correctIds.length && selectedAnswers.every((id) => correctIds.includes(id));
    setAttemptedQuestions((prev) => new Set([...prev, currentIndex]));
    setQuizAnswers((prev) => ({ ...prev, [currentIndex]: selectedAnswers }));
    setIsCorrect(isAnswerCorrect);
    setShowRationale(true);
  };

  const handleNavigate = (index: number) => {
    if (selectedAnswers.length > 0 && currentView === "mock") {
      setMockTestAnswers((prev) => ({ ...prev, [currentIndex]: selectedAnswers }));
    } else if (selectedAnswers.length > 0 && currentView === "quiz") {
      setQuizAnswers((prev) => ({ ...prev, [currentIndex]: selectedAnswers }));
    }
    
    setCurrentIndex(index);
    
    if (currentView === "mock") {
      setSelectedAnswers(mockTestAnswers[index] || []);
    } else if (currentView === "quiz" && attemptedQuestions.has(index)) {
      const savedAnswer = quizAnswers[index] || [];
      setSelectedAnswers(savedAnswer);
      setShowRationale(true);
      const question = currentQuestions[index];
      const correctIds = question.options.filter((opt: any) => opt.isCorrect).map((opt: any) => opt.id);
      const wasCorrect = savedAnswer.length === correctIds.length && savedAnswer.every((id) => correctIds.includes(id));
      setIsCorrect(wasCorrect);
    } else {
      setShowRationale(false);
      setIsCorrect(null);
      setSelectedAnswers([]);
    }
  };

  const handleSubmitMockTest = () => {
    console.log(' Finish Test clicked!');
    console.log('📊 Current state before submission:', {
      currentView,
      mockTestSubmitted,
      selectedAnswers
    });
    
    if (selectedAnswers.length > 0) {
      setMockTestAnswers((prev) => ({ ...prev, [currentIndex]: selectedAnswers }));
    }
    setTimeout(() => {
      console.log('⏰ Timeout executing - setting results view');
      setMockTestSubmitted(true);
      setCurrentView("results");
    }, 100);
  };

  const handleBackToHome = () => {
    setMockTestAnswers({});
    setCurrentView("home");
  };

  const calculateResults = () => {
    const answersToUse = mockTestAnswers;
    let correctCount = 0;
    const categoryResults: Record<string, { correct: number; total: number }> = {};

    const results = currentQuestions.map((question, idx) => {
      const userAnswer = answersToUse[idx] || [];
      const correctIds = question.options.filter((opt: any) => opt.isCorrect).map((opt: any) => opt.id);
      const isAnswerCorrect = userAnswer.length === correctIds.length && userAnswer.every((id) => correctIds.includes(id));
      if (isAnswerCorrect) correctCount++;
      if (!categoryResults[question.category]) categoryResults[question.category] = { correct: 0, total: 0 };
      categoryResults[question.category].total++;
      if (isAnswerCorrect) categoryResults[question.category].correct++;
      return {
        questionNumber: idx + 1,
        question: question.stem,
        category: question.categoryName,
        userAnswer: userAnswer,
        correctAnswer: correctIds,
        isCorrect: isAnswerCorrect,
        rationale: question.rationale,
        options: question.options,
      };
    });

    const percentage = currentQuestions.length > 0 ? Math.round((correctCount / currentQuestions.length) * 100) : 0;
    const weakAreas = Object.entries(categoryResults)
      .filter(([_, data]) => data.total > 0 && data.correct / data.total < 0.6)
      .map(([category, data]) => ({ category, percentage: Math.round((data.correct / data.total) * 100) }));

    return { correctCount, total: currentQuestions.length, percentage, results, categoryResults, weakAreas };
  };

  const currentQuestion = currentQuestions[currentIndex];
  const isSATA = currentQuestion?.type === "SATA";
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === currentQuestions.length - 1;
  const progress = currentQuestions.length > 0 ? ((currentIndex + 1) / currentQuestions.length) * 100 : 0;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", color: "#1f2937" }}>Loading questions from database...</h2>
        </div>
      </div>
    );
  }

  if (questionBank.length === 0) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", color: "#ef4444" }}>No questions found in database</h2>
          <p style={{ color: "#6b7280" }}>Please add questions to your Supabase table</p>
        </div>
      </div>
    );
  }

  if (currentView === "home") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "2rem" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: "700", color: "#1f2937", textAlign: "center", marginBottom: "0.5rem" }}> MONTASTIC</h1>
          <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "2rem", fontSize: "1.1rem" }}>BY NURSE, FOR NURSE, OF NURSE</p>
          <div style={{ backgroundColor: "#1f2937", borderRadius: "16px", padding: "2rem", textAlign: "center", marginBottom: "2rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            <h2 style={{ color: "white", fontSize: "1.5rem", marginBottom: "0.5rem" }}>🎯 Full Mock Test</h2>
            <p style={{ color: "#9ca3af", marginBottom: "1rem" }}>50 Random Questions | 30 Minutes | Comprehensive Analysis</p>
            <button onClick={startMockTest} style={{ backgroundColor: "#10b981", color: "white", fontWeight: "700", padding: "1rem 3rem", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>Start Mock Test</button>
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1f2937", marginBottom: "1.5rem" }}>Choose Your Subject</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {subjects.map((subject) => {
              const questionCount = questionBank.filter(q => q.category === subject.id).length;
              return (
                <button key={subject.id} onClick={() => startSubjectQuiz(subject.id)} style={{ backgroundColor: "white", borderRadius: "12px", padding: "1.5rem", border: "2px solid #e5e7eb", cursor: "pointer", textAlign: "left", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontSize: "2.5rem" }}>{subject.icon}</span>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontWeight: "700", color: "#1f2937", marginBottom: "0.25rem" }}>{subject.name}</h3>
                      <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>{questionCount} Questions</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "mock" && mockTestStarted && !mockTestSubmitted) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "1rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", backgroundColor: "white", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", padding: "1rem", backgroundColor: timeRemaining < 300 ? "#fef2f2" : "#eff6ff", borderRadius: "12px", border: `2px solid ${timeRemaining < 300 ? "#ef4444" : "#3b82f6"}` }}>
            <div>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>Mock Test - Question {currentIndex + 1} of {mockTestQuestions.length}</p>
              <div style={{ width: "200px", height: "8px", backgroundColor: "#e5e7eb", borderRadius: "4px" }}>
                <div style={{ width: `${progress}%`, height: "100%", backgroundColor: "#3b82f6", borderRadius: "4px" }}></div>
              </div>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: timeRemaining < 300 ? "#ef4444" : "#1f2937", fontFamily: "monospace" }}>{formatTime(timeRemaining)}</div>
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1f2937", marginBottom: "1.5rem" }}>{currentQuestion.stem}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {currentQuestion.options.map((option: any) => {
              const isSelected = selectedAnswers.includes(option.id);
              return (
                <button key={option.id} onClick={() => handleSelect(option.id)} style={{ width: "100%", textAlign: "left", padding: "1rem", borderRadius: "12px", border: `2px solid ${isSelected ? "#3b82f6" : "#e5e7eb"}`, backgroundColor: isSelected ? "#eff6ff" : "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.75rem", transition: "all 0.2s" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: currentQuestion.type === "SATA" ? "4px" : "50%", border: `2px solid ${isSelected ? "#3b82f6" : "#d1d5db"}`, backgroundColor: isSelected ? "#3b82f6" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isSelected && <svg style={{ width: "12px", height: "12px", color: "white" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span style={{ color: "#374151", fontWeight: "500" }}><strong style={{ marginRight: "0.5rem" }}>{option.id}.</strong>{option.text}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={() => handleNavigate(currentIndex - 1)} disabled={isFirstQuestion} style={{ flex: 1, padding: "0.75rem", borderRadius: "12px", border: "none", backgroundColor: isFirstQuestion ? "#f3f4f6" : "#6b7280", color: "white", fontWeight: "700", cursor: isFirstQuestion ? "not-allowed" : "pointer" }}>← Previous</button>
            <button onClick={handleSubmitMockTest} style={{ flex: 1, padding: "0.75rem", borderRadius: "12px", border: "none", backgroundColor: "#ef4444", color: "white", fontWeight: "700", cursor: "pointer" }}>Submit Test</button>
            {isLastQuestion ? (
              <button onClick={handleSubmitMockTest} style={{ flex: 2, padding: "0.75rem", borderRadius: "12px", border: "none", backgroundColor: "#10b981", color: "white", fontWeight: "700", cursor: "pointer" }}>Finish & Submit ✓</button>
            ) : (
              <button onClick={() => handleNavigate(currentIndex + 1)} style={{ flex: 2, padding: "0.75rem", borderRadius: "12px", border: "none", backgroundColor: "#1f2937", color: "white", fontWeight: "700", cursor: "pointer" }}>Next →</button>
            )}
          </div>
          <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.5rem" }}>Quick Navigation:</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {mockTestQuestions.map((_, idx) => {
                const isAttemptedQ = mockTestAnswers[idx] && mockTestAnswers[idx].length > 0;
                const isCurrentQ = idx === currentIndex;
                return (
                  <button key={idx} onClick={() => handleNavigate(idx)} style={{ width: "36px", height: "36px", borderRadius: "8px", border: "none", backgroundColor: isCurrentQ ? "#3b82f6" : isAttemptedQ ? "#10b981" : "#e5e7eb", color: "white", fontWeight: "700", cursor: "pointer" }}>{idx + 1}</button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "results") {
    const results = calculateResults();
    const isMockTest = mockTestQuestions.length > 0 && mockTestSubmitted;
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "2rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "2rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", textAlign: "center", marginBottom: "1.5rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1f2937", marginBottom: "1rem" }}>{isMockTest ? " Mock Test Results" : "📊 Quiz Results"}</h1>
            {isMockTest && <p style={{ color: "#6b7280", marginBottom: "1rem" }}>Time Taken: {formatTime(1800 - timeRemaining)}</p>}
            <div style={{ width: "150px", height: "150px", borderRadius: "50%", backgroundColor: results.percentage >= 70 ? "#10b981" : results.percentage >= 50 ? "#f59e0b" : "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <div style={{ color: "white" }}>
                <div style={{ fontSize: "3rem", fontWeight: "700" }}>{results.percentage}%</div>
                <div style={{ fontSize: "1rem", opacity: 0.9 }}>{results.correctCount}/{results.total}</div>
              </div>
            </div>
            <p style={{ fontSize: "1.25rem", fontWeight: "600", color: results.percentage >= 70 ? "#10b981" : results.percentage >= 50 ? "#f59e0b" : "#ef4444", marginBottom: "0.5rem" }}>
              {results.percentage >= 90 ? " Outstanding!" : results.percentage >= 70 ? "✅ Great Job!" : results.percentage >= 50 ? "📚 Good Effort!" : "💪 Keep Practicing!"}
            </p>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>{results.percentage >= 70 ? "You're well prepared for your nursing exam!" : "Review the rationales and weak areas below to improve."}</p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={handleBackToHome} style={{ backgroundColor: "#2563eb", color: "white", fontWeight: "700", padding: "0.75rem 2rem", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "1rem" }}>🏠 Back to Home</button>
              {isMockTest && <button onClick={startMockTest} style={{ backgroundColor: "#10b981", color: "white", fontWeight: "700", padding: "0.75rem 2rem", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "1rem" }}>🔄 Retake Mock Test</button>}
            </div>
          </div>
          {results.weakAreas.length > 0 && (
            <div style={{ backgroundColor: "#fef2f2", borderRadius: "16px", padding: "1.5rem", marginBottom: "1.5rem", border: "2px solid #ef4444" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#991b1b", marginBottom: "1rem" }}>️ Areas Needing Improvement</h2>
              <p style={{ color: "#7f1d1d", marginBottom: "1rem" }}>Focus your study on these subjects:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {results.weakAreas.map((area, idx) => (
                  <div key={idx} style={{ backgroundColor: "white", padding: "1rem", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "600", color: "#1f2937" }}>{subjects.find(s => s.id === area.category)?.name || area.category}</span>
                    <span style={{ backgroundColor: "#ef4444", color: "white", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontWeight: "700" }}>{area.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "1.5rem", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1f2937", marginBottom: "1rem" }}>📈 Subject-wise Performance</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              {Object.entries(results.categoryResults).map(([category, data]) => {
                const percentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                const subject = subjects.find(s => s.id === category);
                return (
                  <div key={category} style={{ padding: "1rem", backgroundColor: percentage >= 70 ? "#f0fdf4" : percentage >= 50 ? "#fef3c7" : "#fef2f2", borderRadius: "8px", border: `2px solid ${percentage >= 70 ? "#10b981" : percentage >= 50 ? "#f59e0b" : "#ef4444"}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <span>{subject?.icon}</span>
                      <span style={{ fontWeight: "600", color: "#1f2937" }}>{subject?.name || category}</span>
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>{data.correct}/{data.total} correct</div>
                    <div style={{ marginTop: "0.5rem", fontWeight: "700", color: percentage >= 70 ? "#166534" : percentage >= 50 ? "#92400e" : "#991b1b" }}>{percentage}%</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "2rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1f2937", marginBottom: "1.5rem" }}> Detailed Review</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {results.results.map((result, idx) => {
                const userAnswerOptions = result.userAnswer.length > 0 ? result.options.filter((opt: any) => result.userAnswer.includes(opt.id)) : [];
                const correctAnswerOptions = result.options.filter((opt: any) => result.correctAnswer.includes(opt.id));
                return (
                  <div key={idx} style={{ padding: "1.5rem", borderRadius: "12px", border: `2px solid ${result.isCorrect ? "#10b981" : "#ef4444"}`, backgroundColor: result.isCorrect ? "#f0fdf4" : "#fef2f2" }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem" }}>
                      <span style={{ fontSize: "1.5rem", marginRight: "0.5rem" }}>{result.isCorrect ? "✅" : "❌"}</span>
                      <div>
                        <strong style={{ color: "#1f2937" }}>Question {result.questionNumber}</strong>
                        <span style={{ marginLeft: "0.75rem", fontSize: "0.875rem", color: "#6b7280", backgroundColor: "#e5e7eb", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>{result.category}</span>
                      </div>
                    </div>
                    <p style={{ color: "#374151", marginBottom: "0.75rem", fontWeight: "500" }}>{result.question}</p>
                    <div style={{ fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                      <p style={{ color: result.isCorrect ? "#166534" : "#991b1b", marginBottom: "0.25rem", fontWeight: "600" }}>
                        <strong>Your Answer:</strong> {userAnswerOptions.length > 0 ? userAnswerOptions.map((opt: any) => `${opt.id}. ${opt.text}`).join(", ") : "Not answered"}
                      </p>
                      {!result.isCorrect && correctAnswerOptions.length > 0 && (
                        <p style={{ color: "#166534", marginBottom: "0.25rem", fontWeight: "600" }}>
                          <strong>Correct Answer:</strong> {correctAnswerOptions.map((opt: any) => `${opt.id}. ${opt.text}`).join(", ")}
                        </p>
                      )}
                    </div>
                    {isMockTest && (
                      <div style={{ backgroundColor: "#dbeafe", padding: "0.75rem", borderRadius: "6px", marginTop: "0.75rem" }}>
                        <p style={{ color: "#1e40af", fontSize: "0.875rem" }}><strong>Rationale:</strong> {result.rationale}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subject = subjects.find(s => s.id === selectedCategory);
  if (!currentQuestion) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading questions...</div>;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "1rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", backgroundColor: "white", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", padding: "1.5rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <button onClick={() => setCurrentView("home")} style={{ backgroundColor: "#e5e7eb", color: "#374151", padding: "0.5rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer", marginBottom: "1rem", fontWeight: "600" }}>← Back to Home</button>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <span style={{ fontSize: "2rem" }}>{subject?.icon}</span>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1f2937" }}>{subject?.name}</h1>
          </div>
          <div style={{ width: "100%", height: "8px", backgroundColor: "#e5e7eb", borderRadius: "4px" }}>
            <div style={{ width: `${progress}%`, height: "100%", backgroundColor: "#3b82f6", borderRadius: "4px", transition: "width 0.3s" }}></div>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.5rem" }}>Question {currentIndex + 1} of {currentQuestions.length}</p>
        </div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1f2937", marginBottom: "1.5rem" }}>{currentQuestion.stem}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {currentQuestion.options.map((option: any) => {
            const isSelected = selectedAnswers.includes(option.id);
            const showCorrect = showRationale && option.isCorrect;
            const showWrong = showRationale && isSelected && !option.isCorrect;
            let backgroundColor = "white";
            let borderColor = "#e5e7eb";
            if (showCorrect) { backgroundColor = "#f0fdf4"; borderColor = "#22c55e"; }
            else if (showWrong) { backgroundColor = "#fef2f2"; borderColor = "#ef4444"; }
            else if (isSelected) { backgroundColor = "#eff6ff"; borderColor = "#3b82f6"; }
            return (
              <button key={option.id} onClick={() => handleSelect(option.id)} disabled={showRationale} style={{ width: "100%", textAlign: "left", padding: "1rem", borderRadius: "12px", border: `2px solid ${borderColor}`, backgroundColor, cursor: showRationale ? "default" : "pointer", display: "flex", alignItems: "center", gap: "0.75rem", transition: "all 0.2s" }}>
                <div style={{ width: "20px", height: "20px", borderRadius: isSATA ? "4px" : "50%", border: `2px solid ${isSelected ? "#3b82f6" : "#d1d5db"}`, backgroundColor: isSelected ? "#3b82f6" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isSelected && <svg style={{ width: "12px", height: "12px", color: "white" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span style={{ color: "#374151", fontWeight: "500" }}><strong style={{ marginRight: "0.5rem" }}>{option.id}.</strong>{option.text}</span>
              </button>
            );
          })}
        </div>
        {showRationale && (
          <div style={{ padding: "1rem", borderRadius: "12px", marginBottom: "1.5rem", borderLeft: `4px solid ${isCorrect ? "#22c55e" : "#ef4444"}`, backgroundColor: isCorrect ? "#f0fdf4" : "#fef2f2" }}>
            <p style={{ fontWeight: "700", marginBottom: "0.5rem", color: isCorrect ? "#166534" : "#991b1b" }}>{isCorrect ? "✅ Correct!" : "❌ Incorrect"}</p>
            <p style={{ color: "#1e40af", fontWeight: "600", marginBottom: "0.5rem", backgroundColor: "#dbeafe", padding: "0.5rem", borderRadius: "6px" }}>📌 Correct Answer: {currentQuestion.options.filter((opt: any) => opt.isCorrect).map((opt: any) => `Option ${opt.id} - ${opt.text}`).join(", ")}</p>
            <p style={{ color: "#374151", fontSize: "0.875rem" }}><strong>Rationale:</strong> {currentQuestion.rationale}</p>
          </div>
        )}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={() => handleNavigate(currentIndex - 1)} disabled={isFirstQuestion} style={{ flex: 1, padding: "0.75rem", borderRadius: "12px", border: "none", backgroundColor: isFirstQuestion ? "#f3f4f6" : "#6b7280", color: "white", fontWeight: "700", cursor: isFirstQuestion ? "not-allowed" : "pointer" }}>← Previous</button>
          {!showRationale ? (
  <button onClick={handleSubmitAnswer} disabled={selectedAnswers.length === 0} style={{ flex: 2, padding: "0.75rem", borderRadius: "12px", border: "none", backgroundColor: selectedAnswers.length > 0 ? "#2563eb" : "#d1d5db", color: "white", fontWeight: "700", cursor: selectedAnswers.length > 0 ? "pointer" : "not-allowed" }}>Submit Answer</button>
) : (
  <button 
    onClick={() => {
      if (isLastQuestion) {
        // Go back to home after finishing subject quiz
        setCurrentView("home");
        setSelectedCategory("");
        setCurrentQuestions([]);
        setCurrentIndex(0);
        setSelectedAnswers([]);
        setShowRationale(false);
        setIsCorrect(null);
        setAttemptedQuestions(new Set());
        setQuizAnswers({});
      } else {
        handleNavigate(currentIndex + 1);
      }
    }} 
    style={{ flex: 2, padding: "0.75rem", borderRadius: "12px", border: "none", backgroundColor: isLastQuestion ? "#10b981" : "#1f2937", color: "white", fontWeight: "700", cursor: "pointer" }}>
    {isLastQuestion ? "✓ Finish Quiz" : "Next →"}
  </button>
)}
        </div>
        <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.5rem" }}>Question Navigator:</p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {currentQuestions.map((_, idx) => {
              const isAttemptedQ = attemptedQuestions.has(idx);
              const isCurrentQ = idx === currentIndex;
              return (
                <button key={idx} onClick={() => handleNavigate(idx)} style={{ width: "36px", height: "36px", borderRadius: "8px", border: "none", backgroundColor: isCurrentQ ? "#3b82f6" : isAttemptedQ ? "#10b981" : "#e5e7eb", color: "white", fontWeight: "700", cursor: "pointer" }}>{idx + 1}</button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}