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
      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "2rem" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "700", color: "#1f2937", textAlign: "center", marginBottom: "0.5rem" }}>MONTASTIC</h1>
          <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "2rem", fontSize: "1.1rem" }}>BY NURSE, FOR NURSE, OF NURSE</p>
          
          <div style={{ backgroundColor: "#1f2937", borderRadius: "16px", padding: "2rem", textAlign: "center", marginBottom: "2rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            <h2 style={{ color: "white", fontSize: "1.5rem", marginBottom: "0.5rem" }}>🎯 Full Mock Test</h2>
            <p style={{ color: "#9ca3af", marginBottom: "1rem" }}>50 Random Questions | 30 Minutes | Comprehensive Analysis</p>
            <button onClick={startMockTest} style={{ backgroundColor: "#10b981", color: "white", fontWeight: "700", padding: "1rem 3rem", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "1.1rem", transition: "transform 0.2s" }} onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"} onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}>Start Mock Test</button>
          </div>

          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1f2937", marginBottom: "1.5rem" }}>Choose Your Subject</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {subjects.map((subject) => {
              const questionCount = categoryCounts[subject.id] || 0;
              return (
                <button key={subject.id} onClick={() => startSubjectQuiz(subject.id)} style={{ backgroundColor: "white", borderRadius: "12px", padding: "1.5rem", border: "2px solid #e5e7eb", cursor: "pointer", textAlign: "left", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }} onMouseOver={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.transform = "translateY(-4px)"; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontSize: "2.5rem" }}>{subject.icon}</span>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontWeight: "700", color: "#1f2937", marginBottom: "0.25rem" }}>{subject.name}</h3>
                      <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                        {categoriesLoading ? 'Loading...' : `${questionCount} Questions`}
                      </p>
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
      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "2rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", backgroundColor: "white", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", padding: "2rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#1f2937", textAlign: "center", marginBottom: "1.5rem" }}>
            Mock Test Results
          </h2>

          <div style={{
            backgroundColor: mockTestResults.score >= mockTestResults.maxScore * 0.5 ? "#10b981" : "#ef4444",
            color: "white",
            padding: "2.5rem",
            borderRadius: "12px",
            textAlign: "center",
            marginBottom: "2rem",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
          }}>
            <p style={{ fontSize: "1.25rem", color: "rgba(255,255,255,0.9)", marginBottom: "0.5rem" }}>
              Your Score (with Negative Marking)
            </p>
            <h1 style={{ fontSize: "5rem", fontWeight: "800", margin: "1rem 0", lineHeight: 1 }}>
              {mockTestResults.score.toFixed(2)}
            </h1>
            <p style={{ fontSize: "1.5rem", opacity: 0.9, margin: "0.5rem 0" }}>
              out of {mockTestResults.maxScore} marks
            </p>
            <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
              <p style={{ fontSize: "1rem", margin: 0 }}>
                Correct: {mockTestResults.correct} | Wrong: {mockTestResults.wrong} | Skipped: {mockTestResults.skipped}
              </p>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem", opacity: 0.9 }}>
                Scoring: +1 for correct, -0.33 for wrong, 0 for skipped
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{ backgroundColor: "#ecfdf5", padding: "1.5rem", borderRadius: "12px", textAlign: "center", border: "2px solid #10b981" }}>
              <p style={{ color: "#059669", fontWeight: "700", fontSize: "2.5rem", margin: 0 }}>{mockTestResults.correct}</p>
              <p style={{ color: "#065f46", fontSize: "0.875rem", margin: "0.25rem 0 0 0" }}>Correct Answers</p>
              <p style={{ color: "#059669", fontWeight: "600", fontSize: "1.125rem", margin: "0.25rem 0 0 0" }}>+{mockTestResults.correct}.00 marks</p>
            </div>
            
            <div style={{ backgroundColor: "#fef2f2", padding: "1.5rem", borderRadius: "12px", textAlign: "center", border: "2px solid #ef4444" }}>
              <p style={{ color: "#dc2626", fontWeight: "700", fontSize: "2.5rem", margin: 0 }}>{mockTestResults.wrong}</p>
              <p style={{ color: "#991b1b", fontSize: "0.875rem", margin: "0.25rem 0 0 0" }}>Wrong Answers</p>
              <p style={{ color: "#dc2626", fontWeight: "600", fontSize: "1.125rem", margin: "0.25rem 0 0 0" }}>-{(mockTestResults.wrong * 0.33).toFixed(2)} marks</p>
            </div>
            
            <div style={{ backgroundColor: "#f3f4f6", padding: "1.5rem", borderRadius: "12px", textAlign: "center", border: "2px solid #6b7280" }}>
              <p style={{ color: "#4b5563", fontWeight: "700", fontSize: "2.5rem", margin: 0 }}>{mockTestResults.skipped}</p>
              <p style={{ color: "#1f2937", fontSize: "0.875rem", margin: "0.25rem 0 0 0" }}>Skipped</p>
              <p style={{ color: "#6b7280", fontWeight: "600", fontSize: "1.125rem", margin: "0.25rem 0 0 0" }}>0.00 marks</p>
            </div>
          </div>

          <div style={{
            backgroundColor: mockTestResults.score >= mockTestResults.maxScore * 0.7 ? "#ecfdf5" :
                             mockTestResults.score >= mockTestResults.maxScore * 0.5 ? "#fef3c7" : "#fef2f2",
            padding: "1.5rem",
            borderRadius: "12px",
            textAlign: "center",
            marginBottom: "2rem",
            border: `2px solid ${mockTestResults.score >= mockTestResults.maxScore * 0.7 ? "#10b981" :
                             mockTestResults.score >= mockTestResults.maxScore * 0.5 ? "#f59e0b" : "#ef4444"}`
          }}>
            <h3 style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: mockTestResults.score >= mockTestResults.maxScore * 0.7 ? "#059669" :
                     mockTestResults.score >= mockTestResults.maxScore * 0.5 ? "#d97706" : "#dc2626",
              margin: "0 0 0.5rem 0"
            }}>
              {mockTestResults.score >= mockTestResults.maxScore * 0.7 ? "🎉 Excellent Work!" :
               mockTestResults.score >= mockTestResults.maxScore * 0.5 ? "👍 Good Effort!" : "💪 Keep Practicing!"}
            </h3>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: 0 }}>
              {mockTestResults.score >= mockTestResults.maxScore * 0.7 ? "You're well prepared for your exam!" :
               mockTestResults.score >= mockTestResults.maxScore * 0.5 ? "Review the weak areas below to improve." :
               "Focus on the areas needing improvement and try again!"}
            </p>
          </div>

          <div style={{ marginTop: "2rem", borderTop: "2px solid #e5e7eb", paddingTop: "2rem" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1f2937", marginBottom: "1.5rem" }}>
               Detailed Question Review
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "600px", overflowY: "auto" }}>
              {mockTestQuestions.map((question, idx) => {
                const userAnswer = mockTestAnswers[idx] || [];
                const isCorrect = userAnswer[0] === question.correctAnswerKey;
                
                return (
                  <div 
                    key={idx} 
                    style={{
                      padding: "1.5rem",
                      borderRadius: "12px",
                      border: `2px solid ${isCorrect ? "#10b981" : "#ef4444"}`,
                      backgroundColor: isCorrect ? "#f0fdf4" : "#fef2f2"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                      <span style={{ fontWeight: "700", fontSize: "1.125rem", color: isCorrect ? "#059669" : "#dc2626" }}>
                        Question {idx + 1}
                      </span>
                      <span style={{ 
                        padding: "0.25rem 0.75rem", 
                        borderRadius: "6px", 
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        backgroundColor: isCorrect ? "#10b981" : "#ef4444",
                        color: "white"
                      }}>
                        {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                      </span>
                    </div>

                    <p style={{ fontSize: "1rem", fontWeight: "600", color: "#1f2937", marginBottom: "1rem", lineHeight: "1.5" }}>
                      {question.stem}
                    </p>

                    <div style={{ marginBottom: "0.75rem" }}>
                      <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                        <strong>Your Answer:</strong>
                      </p>
                      <p style={{ fontSize: "0.9375rem", color: isCorrect ? "#059669" : "#dc2626", fontWeight: "600" }}>
                        {userAnswer.length > 0 
                          ? userAnswer.map((id: string) => {
                              const option = question.options.find((opt: any) => opt.id === id);
                              return `${id}. ${option?.text}`;
                            }).join(", ")
                          : "Not answered"
                        }
                      </p>
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                        <strong>Correct Answer:</strong>
                      </p>
                      <p style={{ fontSize: "0.9375rem", color: "#059669", fontWeight: "600" }}>
                        {question.options.filter((opt: any) => opt.id === question.correctAnswerKey).map((opt: any) => `${opt.id}. ${opt.text}`).join(", ")}
                      </p>
                    </div>

                    {question.rationale && (
                      <div style={{ backgroundColor: "#dbeafe", padding: "1rem", borderRadius: "8px", borderLeft: "4px solid #3b82f6" }}>
                        <p style={{ fontSize: "0.875rem", fontWeight: "700", color: "#1e40af", marginBottom: "0.5rem" }}>
                           Rationale:
                        </p>
                        <p style={{ fontSize: "0.875rem", color: "#1e3a8a", lineHeight: "1.6" }}>
                          {question.rationale}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button onClick={handleBackToHome} style={{ padding: "0.75rem 2rem", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
              Back to Home
            </button>
            <button onClick={startMockTest} style={{ padding: "0.75rem 2rem", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
              Retake Mock Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SUBJECT QUIZ VIEW
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