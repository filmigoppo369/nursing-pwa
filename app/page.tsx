"use client";
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from "react";

const subjects = [
  { id: "pediatric", name: "Pediatric Nursing", icon: "👶" },
  { id: "medsurg", name: "Med-Surgical Nursing", icon: "🏥" },
  { id: "mentalhealth", name: "Mental Health Nursing", icon: "🧠" },
  { id: "community", name: "Community Health Nursing", icon: "🏘️" },
  { id: "obgyn", name: "OB/GYN Nursing", icon: "🤰" },
  { id: "anatomy", name: "Anatomy & Physiology", icon: "🦴" },
  { id: "psychology", name: "Psychology", icon: "💭" },
  { id: "nutrition", name: "Nutrition & Biochemistry", icon: "🥗" },
  { id: "microbiology", name: "Microbiology/Infection Control", icon: "🦠" },
];

export default function NursingApp() {
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
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [mockTestResults, setMockTestResults] = useState<any>(null);

  // Fetch category counts
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('category');

        if (error) throw error;

        const counts: Record<string, number> = {};
        if (data) {
          data.forEach((q: any) => {
            if (q.category) {
              counts[q.category] = (counts[q.category] || 0) + 1;
            }
          });
        }
        
        setCategoryCounts(counts);
        setCategoriesLoading(false);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching counts:', error);
        setLoading(false);
      }
    };
    fetchCategoryCounts();
  }, []);

  // Timer for mock test
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

  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startSubjectQuiz = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('id, category, categoryName, stem, option_a, option_b, option_c, option_d, correct_answer, rationale')
        .eq('category', categoryId);

      if (error) throw error;

      // SECURITY FIX: Do not send isCorrect to client. Store correct_answer_key instead.
      const formattedQuestions = data.map((q: any) => ({
        id: q.id,
        category: q.category,
        categoryName: q.categoryName,
        type: 'MCQ',
        stem: q.stem,
        correctAnswerKey: q.correct_answer, // Hidden key for validation
        options: [
          { id: 'A', text: q.option_a },
          { id: 'B', text: q.option_b },
          { id: 'C', text: q.option_c },
          { id: 'D', text: q.option_d },
        ],
        rationale: q.rationale,
      }));

      const randomizedQuestions = shuffleArray(formattedQuestions);
      setCurrentQuestions(randomizedQuestions);
      setCurrentIndex(0);
      setSelectedAnswers([]);
      setShowRationale(false);
      setIsCorrect(null);
      setAttemptedQuestions(new Set());
      setQuizAnswers({});
      setSelectedCategory(categoryId);
      setCurrentView("quiz");
    } catch (error) {
      console.error('Error starting quiz:', error);
    }
  };

  const startMockTest = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('id, category, categoryName, stem, option_a, option_b, option_c, option_d, correct_answer, rationale');

      if (error) throw error;

      // SECURITY FIX: Do not send isCorrect to client
      const formattedQuestions = data.map((q: any) => ({
        id: q.id,
        category: q.category,
        categoryName: q.categoryName,
        type: 'MCQ',
        stem: q.stem,
        correctAnswerKey: q.correct_answer,
        options: [
          { id: 'A', text: q.option_a },
          { id: 'B', text: q.option_b },
          { id: 'C', text: q.option_c },
          { id: 'D', text: q.option_d },
        ],
        rationale: q.rationale,
      }));

      const shuffled = shuffleArray(formattedQuestions);
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
    } catch (error) {
      console.error('Error starting mock test:', error);
    }
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
    
    // Validate against hidden key
    const correctIds = [currentQuestion.correctAnswerKey]; 
    const isAnswerCorrect = selectedAnswers.length === correctIds.length && 
                            selectedAnswers.every((id) => correctIds.includes(id));
    
    setAttemptedQuestions((prev) => {
      const newSet = new Set(prev);
      newSet.add(currentIndex);
      return newSet;
    });
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
      const correctIds = [question.correctAnswerKey];
      const wasCorrect = savedAnswer.length === correctIds.length && savedAnswer.every((id) => correctIds.includes(id));
      setIsCorrect(wasCorrect);
    } else {
      setShowRationale(false);
      setIsCorrect(null);
      setSelectedAnswers([]);
    }
  };

  const handleSubmitMockTest = () => {
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    let totalScore = 0;

    mockTestQuestions.forEach((q, index) => {
      const userAnswer = mockTestAnswers[index];
      const isAttempted = userAnswer && userAnswer.length > 0;

      if (!isAttempted) {
        skippedCount++;
      } else {
        const selectedAnswerId = userAnswer[0];
        const isCorrect = selectedAnswerId === q.correctAnswerKey;

        if (isCorrect) {
          correctCount++;
          totalScore += 1;
        } else {
          wrongCount++;
          totalScore -= 1 / 3; // Negative marking
        }
      }
    });

    const finalScore = Math.round(totalScore * 100) / 100;

    setMockTestResults({
      totalQuestions: mockTestQuestions.length,
      correct: correctCount,
      wrong: wrongCount,
      skipped: skippedCount,
      score: finalScore,
      maxScore: mockTestQuestions.length
    });

    setMockTestSubmitted(true);
    setCurrentView("results");
  };

  const handleBackToHome = () => {
    setMockTestAnswers({});
    setCurrentView("home");
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

  const totalQuestions = Object.values(categoryCounts).reduce((sum: number, count: number) => sum + count, 0);
  if (!loading && totalQuestions === 0) {
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
    // ✅ CORRECT - Use only shorthand
<div style={{ 
  padding: "2rem 2rem 1rem 2rem" 
}}>
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>  
        <h1 style={{ 
          fontSize: "2rem",  // Slightly smaller for mobile
          fontWeight: "700", 
          color: "#1f2937", 
          textAlign: "center", 
          marginBottom: "0.5rem" 
        }}>
          MONTASTIC
        </h1>
        <p style={{ 
          textAlign: "center", 
          color: "#6b7280", 
          marginBottom: "1.5rem", 
          fontSize: "1rem" 
        }}>
          BY NURSE, FOR NURSE, OF NURSE
        </p>
        
        {/* Mock Test Card - Centered */}
        <div style={{ 
          backgroundColor: "#1f2937", 
          borderRadius: "12px", 
          padding: "1.25rem 1.5rem",
          textAlign: "center", 
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          maxWidth: "100%",
          margin: "0 auto 1.5rem auto"  // Center the card
        }}>
          <h2 style={{ 
            color: "white", 
            fontSize: "1.25rem",
            marginBottom: "0.5rem",
            fontWeight: "700"
          }}>
            🎯 Full Mock Test
          </h2>
          <p style={{ 
            color: "#d1d5db", 
            marginBottom: "1rem",
            fontSize: "0.85rem",
            lineHeight: "1.4",
            fontWeight: "500"
          }}>
            50 Questions | 30 Minutes | -1/3 Negative Marking | Result Analysis
          </p>
          <button 
            onClick={startMockTest} 
            style={{ 
              backgroundColor: "#10b981", 
              color: "white", 
              fontWeight: "700", 
              padding: "0.75rem 2rem",
              borderRadius: "10px", 
              border: "none", 
              cursor: "pointer", 
              fontSize: "1rem",
              transition: "transform 0.2s",
              width: "100%",
              maxWidth: "260px"
            }} 
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.03)"} 
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Start Mock Test
          </button>
        </div>

        <h2 style={{ 
          fontSize: "1.25rem", 
          fontWeight: "700", 
          color: "#1f2937", 
          marginBottom: "1rem",
          textAlign: "center"  // Center the heading
        }}>
          Choose Your Subject
        </h2>
        
        {/* 2-Column Grid - Properly Aligned */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "0.625rem",  // Reduced gap for mobile (10px)
          width: "100%",
          maxWidth: "100%"
        }}>
          {subjects.map((subject) => {
            const questionCount = categoryCounts[subject.id] || 0;
            return (
              <button 
                key={subject.id} 
                onClick={() => startSubjectQuiz(subject.id)} 
                style={{ 
                  backgroundColor: "white", 
                  borderRadius: "12px", 
                  padding: "0.875rem",  // Reduced padding
                  border: "2px solid #e5e7eb", 
                  cursor: "pointer", 
                  textAlign: "center",  // Center align content
                  transition: "all 0.2s", 
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  minHeight: "110px",  // Reduced height
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%"  // Ensure full width within grid cell
                }} 
                onMouseOver={(e) => { 
                  e.currentTarget.style.borderColor = "#3b82f6"; 
                  e.currentTarget.style.transform = "translateY(-2px)"; 
                }} 
                onMouseOut={(e) => { 
                  e.currentTarget.style.borderColor = "#e5e7eb"; 
                  e.currentTarget.style.transform = "translateY(0)"; 
                }}
              >
                <span style={{ fontSize: "1.75rem", marginBottom: "0.375rem" }}>{subject.icon}</span>
                <h3 style={{ 
                  fontWeight: "700", 
                  color: "#1f2937", 
                  marginBottom: "0.25rem", 
                  fontSize: "0.8125rem",  // Smaller font (13px)
                  lineHeight: "1.2",
                  margin: "0 0 0.25rem 0"
                }}>
                  {subject.name}
                </h3>
                <p style={{ 
                  color: "#6b7280", 
                  fontSize: "0.6875rem",  // Smaller font (11px)
                  margin: 0,
                  fontWeight: "500"
                }}>
                  {categoriesLoading ? 'Loading...' : `${questionCount} Qs`}
                </p>
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
          {/* Timer Display - Red Rectangle at Top */}
          <div style={{ 
            backgroundColor: "#dc2626", 
            color: "white", 
            padding: "0.75rem", 
            borderRadius: "8px", 
            textAlign: "center", 
            marginBottom: "1rem",
            fontSize: "1.5rem",
            fontWeight: "700",
            fontFamily: "monospace",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
          }}>
            ⏱️ {formatTime(timeRemaining)}
          </div>

          {/* Question Number and Progress Bar */}
          <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem", fontWeight: "600" }}>
              Mock Test - Question {currentIndex + 1} of {mockTestQuestions.length}
            </p>
            <div style={{ width: "100%", height: "8px", backgroundColor: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, height: "100%", backgroundColor: "#3b82f6", borderRadius: "4px", transition: "width 0.3s ease" }}></div>
            </div>
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
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.5rem" }}>Question Navigator:</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {mockTestQuestions.map((_, idx) => {
                const isAttemptedQ = mockTestAnswers[idx] && mockTestAnswers[idx].length > 0;
                const isCurrentQ = idx === currentIndex;
                const isSkippedQ = idx < currentIndex && !isAttemptedQ;
                const isAccessible = idx <= currentIndex;

                let bgColor = "#e5e7eb";
                let cursor = "not-allowed";
                let opacity = 0.4;

                if (isAccessible) {
                  opacity = 1;
                  if (isCurrentQ) {
                    bgColor = "#3b82f6";
                    cursor = "pointer";
                  } else if (isAttemptedQ) {
                    bgColor = "#10b981";
                    cursor = "pointer";
                  } else if (isSkippedQ) {
                    bgColor = "#ef4444";
                    cursor = "pointer";
                  } else {
                    bgColor = "#9ca3af";
                    cursor = "pointer";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => isAccessible && handleNavigate(idx)}
                    disabled={!isAccessible}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: bgColor,
                      color: "white",
                      fontWeight: "700",
                      cursor: cursor,
                      opacity: opacity,
                      transition: "all 0.2s"
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.75rem", fontSize: "0.75rem", color: "#6b7280", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <div style={{ width: "12px", height: "12px", backgroundColor: "#10b981", borderRadius: "2px" }}></div>
                <span>Attempted</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <div style={{ width: "12px", height: "12px", backgroundColor: "#ef4444", borderRadius: "2px" }}></div>
                <span>Skipped</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <div style={{ width: "12px", height: "12px", backgroundColor: "#3b82f6", borderRadius: "2px" }}></div>
                <span>Current Question</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "results" && mockTestResults) {
    return (
 
<div style={{ 
  padding: "2rem 2rem 1rem 2rem" 
}}>
        <div style={{ maxWidth: "800px", margin: "0 auto", backgroundColor: "white", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", padding: "1.5rem" }}>
        
        {/* Buttons at the top */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginBottom: "1.5rem" }}>
          <button 
            onClick={handleBackToHome} 
            style={{ 
              flex: 1, 
              padding: "0.75rem 1rem", 
              backgroundColor: "#3b82f6", 
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              fontWeight: "700", 
              cursor: "pointer",
              fontSize: "0.875rem"
            }}
          >
            ← Back to Home
          </button>
          <button 
            onClick={startMockTest} 
            style={{ 
              flex: 1, 
              padding: "0.75rem 1rem", 
              backgroundColor: "#10b981", 
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              fontWeight: "700", 
              cursor: "pointer",
              fontSize: "0.875rem"
            }}
          >
            Retake Test
          </button>
        </div>

        <h2 style={{ 
          fontSize: "1.5rem", 
          fontWeight: "700", 
          color: "#1f2937", 
          textAlign: "center", 
          marginBottom: "1.5rem" 
        }}>
          Mock Test Results
        </h2>

        {/* Compact Red/Green Score Card */}
        <div style={{
          backgroundColor: mockTestResults.score >= mockTestResults.maxScore * 0.5 ? "#10b981" : "#ef4444",
          color: "white",
          padding: "1.25rem 1rem",
          borderRadius: "12px",
          textAlign: "center",
          marginBottom: "1.5rem",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          <p style={{ 
            fontSize: "0.9375rem", 
            color: "rgba(255,255,255,0.95)", 
            marginBottom: "0.5rem",
            fontWeight: "600"
          }}>
            Your Score
          </p>
          <h1 style={{ 
            fontSize: "3.5rem", 
            fontWeight: "800", 
            margin: "0.5rem 0", 
            lineHeight: 1,
            textAlign: "center"
          }}>
            {mockTestResults.score.toFixed(2)}
          </h1>
          <p style={{ 
            fontSize: "1rem", 
            opacity: 0.95, 
            margin: "0.5rem 0" 
          }}>
            out of {mockTestResults.maxScore} marks
          </p>
          <div style={{ 
            marginTop: "0.75rem", 
            paddingTop: "0.75rem", 
            borderTop: "1px solid rgba(255,255,255,0.3)",
            fontSize: "0.8125rem"
          }}>
            <p style={{ margin: "0.25rem 0" }}>
              Scoring: +1 correct, -0.33 wrong
            </p>
          </div>
        </div>

        {/* Rest of the results cards remain the same... */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <div style={{ backgroundColor: "#ecfdf5", padding: "1.25rem", borderRadius: "12px", textAlign: "center", border: "2px solid #10b981" }}>
            <p style={{ color: "#059669", fontWeight: "700", fontSize: "2rem", margin: 0 }}>{mockTestResults.correct}</p>
            <p style={{ color: "#065f46", fontSize: "0.8125rem", margin: "0.25rem 0 0 0" }}>Correct</p>
            <p style={{ color: "#059669", fontWeight: "600", fontSize: "0.9375rem", margin: "0.25rem 0 0 0" }}>+{mockTestResults.correct}.00</p>
          </div>
          
          <div style={{ backgroundColor: "#fef2f2", padding: "1.25rem", borderRadius: "12px", textAlign: "center", border: "2px solid #ef4444" }}>
            <p style={{ color: "#dc2626", fontWeight: "700", fontSize: "2rem", margin: 0 }}>{mockTestResults.wrong}</p>
            <p style={{ color: "#991b1b", fontSize: "0.8125rem", margin: "0.25rem 0 0 0" }}>Wrong</p>
            <p style={{ color: "#dc2626", fontWeight: "600", fontSize: "0.9375rem", margin: "0.25rem 0 0 0" }}>-{(mockTestResults.wrong * 0.33).toFixed(2)}</p>
          </div>
          
          <div style={{ backgroundColor: "#f3f4f6", padding: "1.25rem", borderRadius: "12px", textAlign: "center", border: "2px solid #6b7280" }}>
            <p style={{ color: "#4b5563", fontWeight: "700", fontSize: "2rem", margin: 0 }}>{mockTestResults.skipped}</p>
            <p style={{ color: "#1f2937", fontSize: "0.8125rem", margin: "0.25rem 0 0 0" }}>Skipped</p>
            <p style={{ color: "#6b7280", fontWeight: "600", fontSize: "0.9375rem", margin: "0.25rem 0 0 0" }}>0.00</p>
          </div>
        </div>

        {/* Performance message */}
        <div style={{
          backgroundColor: mockTestResults.score >= mockTestResults.maxScore * 0.7 ? "#ecfdf5" :
                           mockTestResults.score >= mockTestResults.maxScore * 0.5 ? "#fef3c7" : "#fef2f2",
          padding: "1.25rem",
          borderRadius: "12px",
          textAlign: "center",
          marginBottom: "1.5rem",
          border: `2px solid ${mockTestResults.score >= mockTestResults.maxScore * 0.7 ? "#10b981" :
                           mockTestResults.score >= mockTestResults.maxScore * 0.5 ? "#f59e0b" : "#ef4444"}`
        }}>
          <h3 style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            color: mockTestResults.score >= mockTestResults.maxScore * 0.7 ? "#059669" :
                   mockTestResults.score >= mockTestResults.maxScore * 0.5 ? "#d97706" : "#dc2626",
            margin: "0 0 0.5rem 0"
          }}>
            {mockTestResults.score >= mockTestResults.maxScore * 0.7 ? "🎉 Excellent Work!" :
             mockTestResults.score >= mockTestResults.maxScore * 0.5 ? " Good Effort!" : "💪 Keep Practicing!"}
          </h3>
          <p style={{ color: "#6b7280", fontSize: "0.8125rem", margin: 0 }}>
            {mockTestResults.score >= mockTestResults.maxScore * 0.7 ? "You're well prepared!" :
             mockTestResults.score >= mockTestResults.maxScore * 0.5 ? "Review weak areas to improve." :
             "Focus on areas needing improvement!"}
          </p>
        </div>

        {/* Question Review Section */}
        <div style={{ marginTop: "1.5rem", borderTop: "2px solid #e5e7eb", paddingTop: "1.5rem" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1f2937", marginBottom: "1rem" }}>
            Detailed Question Review
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "500px", overflowY: "auto" }}>
            {mockTestQuestions.map((question, idx) => {
              const userAnswer = mockTestAnswers[idx] || [];
              const isCorrect = userAnswer[0] === question.correctAnswerKey;
              
              return (
                <div 
                  key={idx} 
                  style={{
                    padding: "1rem",
                    borderRadius: "12px",
                    border: `2px solid ${isCorrect ? "#10b981" : "#ef4444"}`,
                    backgroundColor: isCorrect ? "#f0fdf4" : "#fef2f2"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <span style={{ fontWeight: "700", fontSize: "1rem", color: isCorrect ? "#059669" : "#dc2626" }}>
                      Q{idx + 1}
                    </span>
                    <span style={{ 
                      padding: "0.25rem 0.5rem", 
                      borderRadius: "4px", 
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      backgroundColor: isCorrect ? "#10b981" : "#ef4444",
                      color: "white"
                    }}>
                      {isCorrect ? "✓" : "✗"}
                    </span>
                  </div>

                  <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "#1f2937", marginBottom: "0.75rem", lineHeight: "1.4" }}>
                    {question.stem}
                  </p>

                  <div style={{ marginBottom: "0.5rem" }}>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                      <strong>Your Answer:</strong> {userAnswer.length > 0 ? userAnswer[0] : "Not answered"}
                    </p>
                  </div>

                  <div style={{ marginBottom: "0.75rem" }}>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                      <strong>Correct:</strong> {question.correctAnswerKey}
                    </p>
                  </div>

                  {question.rationale && (
                    <div style={{ backgroundColor: "#dbeafe", padding: "0.75rem", borderRadius: "6px", borderLeft: "3px solid #3b82f6" }}>
                      <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "#1e40af", marginBottom: "0.25rem" }}>
                        Rationale:
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "#1e3a8a", lineHeight: "1.5", margin: 0 }}>
                        {question.rationale}
                      </p>
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


  // SUBJECT QUIZ VIEW
  const subject = subjects.find(s => s.id === selectedCategory);
  if (!currentQuestion) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading questions...</div>;

  return (
// ✅ CORRECT - Use only shorthand
<div style={{ 
  padding: "2rem 2rem 1rem 2rem" 
}}>
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
            const showCorrect = showRationale && option.id === currentQuestion.correctAnswerKey;
            const showWrong = showRationale && isSelected && option.id !== currentQuestion.correctAnswerKey;
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
            <p style={{ color: "#1e40af", fontWeight: "600", marginBottom: "0.5rem", backgroundColor: "#dbeafe", padding: "0.5rem", borderRadius: "6px" }}>
              📌 Correct Answer: {currentQuestion.options.filter((opt: any) => opt.id === currentQuestion.correctAnswerKey).map((opt: any) => `Option ${opt.id} - ${opt.text}`).join(", ")}
            </p>
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
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.5rem" }}>Question Navigator (Sequential Unlock):</p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {currentQuestions.map((_, idx) => {
              const isAttemptedQ = attemptedQuestions.has(idx);
              const isCurrentQ = idx === currentIndex;
              const isAccessible = idx === 0 || attemptedQuestions.has(idx - 1);

              let bgColor = "#e5e7eb";
              let cursor = "not-allowed";
              let opacity = 0.4;

              if (isAccessible) {
                opacity = 1;
                if (isCurrentQ) {
                  bgColor = "#3b82f6";
                  cursor = "default";
                } else if (isAttemptedQ) {
                  bgColor = "#10b981";
                  cursor = "pointer";
                } else {
                  bgColor = "#9ca3af";
                  cursor = "pointer";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => isAccessible && handleNavigate(idx)}
                  disabled={!isAccessible}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: bgColor,
                    color: "white",
                    fontWeight: "700",
                    cursor: cursor,
                    opacity: opacity,
                    transition: "all 0.2s"
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}