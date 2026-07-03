"use client";

import { useState } from "react";

const mockQuestions = [
  {
    id: 1,
    type: "MCQ",
    stem: "A client is prescribed digoxin. Which assessment finding should the nurse report immediately?",
    options: [
      { id: "A", text: "Heart rate of 58 beats/min", isCorrect: false },
      { id: "B", text: "Visual disturbances (yellow-green halos)", isCorrect: true },
      { id: "C", text: "Blood pressure of 130/80 mmHg", isCorrect: false },
      { id: "D", text: "Respiratory rate of 16 breaths/min", isCorrect: false },
    ],
    rationale: "Visual disturbances like yellow-green halos are classic signs of digoxin toxicity and must be reported immediately. A heart rate of 58 is slightly low but often expected; hold the dose and monitor.",
  },
  {
    id: 2,
    type: "SATA",
    stem: "A nurse is caring for a client with severe burns. Which findings are expected during the emergent phase? (Select all that apply)",
    options: [
      { id: "A", text: "Hyperkalemia", isCorrect: true },
      { id: "B", text: "Hyponatremia", isCorrect: true },
      { id: "C", text: "Metabolic alkalosis", isCorrect: false },
      { id: "D", text: "Hypovolemia", isCorrect: true },
    ],
    rationale: "During the emergent phase, fluid shifts cause hypovolemia and hyponatremia. Cell destruction releases potassium, causing hyperkalemia. Metabolic acidosis (not alkalosis) occurs due to poor tissue perfusion.",
  },
  {
    id: 3,
    type: "MCQ",
    stem: "A nurse is caring for a client with heart failure. Which finding indicates the client is experiencing fluid volume overload?",
    options: [
      { id: "A", text: "Weight loss of 2 kg in 24 hours", isCorrect: false },
      { id: "B", text: "Bilateral crackles in the lungs", isCorrect: true },
      { id: "C", text: "Decreased blood pressure", isCorrect: false },
      { id: "D", text: "Increased urine output", isCorrect: false },
    ],
    rationale: "Bilateral crackles indicate pulmonary edema, a classic sign of fluid volume overload in heart failure. Weight loss, decreased BP, and increased urine output would suggest fluid deficit, not overload.",
  },
];

export default function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showRationale, setShowRationale] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  // Track attempted questions and their answers
  const [attemptedQuestions, setAttemptedQuestions] = useState<Set<number>>(new Set());
  const [userAnswers, setUserAnswers] = useState<Record<number, string[]>>({});

  const currentQuestion = mockQuestions[currentIndex];
  const isSATA = currentQuestion.type === "SATA";
  const isAttempted = attemptedQuestions.has(currentIndex);

  const getSavedAnswers = () => {
    if (isAttempted && userAnswers[currentIndex]) {
      return userAnswers[currentIndex];
    }
    return [];
  };

  const handleQuestionChange = (newIndex: number) => {
    setCurrentIndex(newIndex);
    const savedAnswers = userAnswers[newIndex] || [];
    setSelectedAnswers(savedAnswers);
    if (attemptedQuestions.has(newIndex)) {
      setShowRationale(true);
      const question = mockQuestions[newIndex];
      const correctIds = question.options
        .filter((opt) => opt.isCorrect)
        .map((opt) => opt.id);
      const wasCorrect =
        savedAnswers.length === correctIds.length &&
        savedAnswers.every((id) => correctIds.includes(id));
      setIsCorrect(wasCorrect);
    } else {
      setShowRationale(false);
      setIsCorrect(null);
    }
  };

  const handleSelect = (optionId: string) => {
    if (showRationale) return;
    if (isSATA) {
      setSelectedAnswers((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
      );
    } else {
      setSelectedAnswers([optionId]);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswers.length === 0) return;
    
    const correctIds = currentQuestion.options
      .filter((opt) => opt.isCorrect)
      .map((opt) => opt.id);
    const isAnswerCorrect =
      selectedAnswers.length === correctIds.length &&
      selectedAnswers.every((id) => correctIds.includes(id));

    setAttemptedQuestions((prev) => new Set([...prev, currentIndex]));
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: selectedAnswers }));
    
    setIsCorrect(isAnswerCorrect);
    setShowRationale(true);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      handleQuestionChange(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < mockQuestions.length - 1) {
      handleQuestionChange(currentIndex + 1);
    }
  };

  const handleFinishQuiz = () => {
    setShowResults(true);
  };

  const handleRetakeQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setShowRationale(false);
    setIsCorrect(null);
    setShowResults(false);
    setAttemptedQuestions(new Set());
    setUserAnswers({});
  };

  const getCorrectAnswerText = () => {
    const correctOptions = currentQuestion.options.filter((opt) => opt.isCorrect);
    return correctOptions.map((opt) => `Option ${opt.id} - ${opt.text}`).join(", ");
  };

  // Calculate results
  const calculateResults = () => {
    let correctCount = 0;
    const results = mockQuestions.map((question, idx) => {
      const userAnswer = userAnswers[idx] || [];
      const correctIds = question.options
        .filter((opt) => opt.isCorrect)
        .map((opt) => opt.id);
      const isCorrect =
        userAnswer.length === correctIds.length &&
        userAnswer.every((id) => correctIds.includes(id));
      
      if (isCorrect) correctCount++;
      
      return {
        questionNumber: idx + 1,
        question: question.stem,
        userAnswer: userAnswer,
        correctAnswer: correctIds,
        isCorrect,
      };
    });

    const percentage = Math.round((correctCount / mockQuestions.length) * 100);
    return { correctCount, total: mockQuestions.length, percentage, results };
  };

  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === mockQuestions.length - 1;
  const progress = ((currentIndex + 1) / mockQuestions.length) * 100;

  // Results Screen
  if (showResults) {
    const results = calculateResults();
    
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Score Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem' }}>
              📊 Quiz Results
            </h1>
            
            <div style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              backgroundColor: results.percentage >= 70 ? '#10b981' : results.percentage >= 50 ? '#f59e0b' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <div style={{ color: 'white' }}>
                <div style={{ fontSize: '3rem', fontWeight: '700' }}>{results.percentage}%</div>
                <div style={{ fontSize: '1rem', opacity: 0.9 }}>
                  {results.correctCount}/{results.total}
                </div>
              </div>
            </div>

            <p style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: results.percentage >= 70 ? '#10b981' : results.percentage >= 50 ? '#f59e0b' : '#ef4444',
              marginBottom: '0.5rem'
            }}>
              {results.percentage >= 90 ? "🏆 Outstanding!" :
               results.percentage >= 70 ? "✅ Great Job!" :
               results.percentage >= 50 ? "📚 Good Effort!" :
               "💪 Keep Practicing!"}
            </p>
            
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              {results.percentage >= 70 
                ? "You're well prepared for your nursing exam!" 
                : "Review the rationales and try again to improve your score."}
            </p>

            <button
              onClick={handleRetakeQuiz}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                fontWeight: '700',
                padding: '0.75rem 2rem',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                marginRight: '0.75rem'
              }}
            >
              🔄 Retake Quiz
            </button>
          </div>

          {/* Detailed Results */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '1.5rem' }}>
              📝 Detailed Review
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {results.results.map((result, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: `2px solid ${result.isCorrect ? '#10b981' : '#ef4444'}`,
                    backgroundColor: result.isCorrect ? '#f0fdf4' : '#fef2f2'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{
                      fontSize: '1.25rem',
                      marginRight: '0.5rem'
                    }}>
                      {result.isCorrect ? '✅' : '❌'}
                    </span>
                    <strong style={{ color: '#1f2937' }}>
                      Question {result.questionNumber}
                    </strong>
                  </div>
                  
                  <p style={{ color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    {result.question}
                  </p>
                  
                  <div style={{ fontSize: '0.875rem' }}>
                    <p style={{ color: result.isCorrect ? '#166534' : '#991b1b', marginBottom: '0.25rem' }}>
                      <strong>Your Answer:</strong> {result.userAnswer.length > 0 ? result.userAnswer.join(', ') : 'Not answered'}
                    </p>
                    {!result.isCorrect && (
                      <p style={{ color: '#166534', marginBottom: '0.25rem' }}>
                        <strong>Correct Answer:</strong> {result.correctAnswer.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Screen
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '1rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '800px', 
        backgroundColor: 'white', 
        borderRadius: '16px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
        padding: '1.5rem' 
      }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#4b5563' }}>
            <span>Progress</span>
            <span>{currentIndex + 1} / {mockQuestions.length}</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${progress}%`, 
              height: '100%', 
              backgroundColor: '#2563eb', 
              transition: 'width 0.3s ease' 
            }}></div>
          </div>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            color: '#2563eb', 
            backgroundColor: '#eff6ff', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '9999px' 
          }}>
            Question {currentIndex + 1} of {mockQuestions.length}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {isAttempted && (
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: '700', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '4px',
                backgroundColor: '#fef3c7',
                color: '#92400e'
              }}>
                📝 Review Mode
              </span>
            )}
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: '700', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '4px',
              backgroundColor: isSATA ? '#f3e8ff' : '#f3f4f6',
              color: isSATA ? '#7c3aed' : '#4b5563'
            }}>
              {isSATA ? "Select All That Apply" : "Single Choice"}
            </span>
          </div>
        </div>

        {/* Question Stem */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '1.5rem', lineHeight: '1.625' }}>
          {currentQuestion.stem}
        </h2>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswers.includes(option.id);
            const showCorrect = showRationale && option.isCorrect;
            const showWrong = showRationale && isSelected && !option.isCorrect;
            
            let backgroundColor = 'white';
            let borderColor = '#e5e7eb';
            let borderWidth = '2px';
            
            if (showCorrect) {
              backgroundColor = '#f0fdf4';
              borderColor = '#22c55e';
            } else if (showWrong) {
              backgroundColor = '#fef2f2';
              borderColor = '#ef4444';
            } else if (isSelected) {
              backgroundColor = '#eff6ff';
              borderColor = '#3b82f6';
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                disabled={showRationale}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: `${borderWidth} solid ${borderColor}`,
                  backgroundColor,
                  cursor: showRationale ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: isSATA ? '4px' : '50%',
                  border: `2px solid ${isSelected ? '#3b82f6' : '#d1d5db'}`,
                  backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  {isSelected && (
                    <svg style={{ width: '12px', height: '12px', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span style={{ color: '#374151', fontWeight: '500' }}>
                  <strong style={{ marginRight: '0.5rem' }}>{option.id}.</strong>
                  {option.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Rationale with Correct Answer */}
        {showRationale && (
          <div style={{
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            borderLeft: `4px solid ${isCorrect ? '#22c55e' : '#ef4444'}`,
            backgroundColor: isCorrect ? '#f0fdf4' : '#fef2f2'
          }}>
            <p style={{ fontWeight: '700', marginBottom: '0.5rem', color: isCorrect ? '#166534' : '#991b1b', fontSize: '1rem' }}>
              {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
            </p>
            <p style={{ 
              fontWeight: '600', 
              marginBottom: '0.5rem', 
              color: '#1e40af',
              fontSize: '0.9rem',
              backgroundColor: '#dbeafe',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px'
            }}>
              📌 Correct Answer: {getCorrectAnswerText()}
            </p>
            <p style={{ color: '#374151', fontSize: '0.875rem', lineHeight: '1.625' }}>
              <strong>Rationale:</strong> {currentQuestion.rationale}
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            style={{
              flex: 1,
              minWidth: '120px',
              backgroundColor: isFirstQuestion ? '#f3f4f6' : '#6b7280',
              color: isFirstQuestion ? '#9ca3af' : 'white',
              fontWeight: '700',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              border: 'none',
              cursor: isFirstQuestion ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            ← Previous
          </button>

          {!showRationale ? (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswers.length === 0}
              style={{
                flex: 2,
                minWidth: '150px',
                backgroundColor: selectedAnswers.length > 0 ? '#2563eb' : '#d1d5db',
                color: 'white',
                fontWeight: '700',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                cursor: selectedAnswers.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s'
              }}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={isLastQuestion ? handleFinishQuiz : handleNext}
              style={{
                flex: 2,
                minWidth: '150px',
                backgroundColor: '#1f2937',
                color: 'white',
                fontWeight: '700',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {isLastQuestion ? "🏁 Finish Quiz" : "Next Question →"}
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '600' }}>
            Question Navigator (click to jump):
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {mockQuestions.map((_, idx) => {
              const isAttemptedQ = attemptedQuestions.has(idx);
              const isCurrentQ = idx === currentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => handleQuestionChange(idx)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isCurrentQ ? '#2563eb' : isAttemptedQ ? '#10b981' : '#e5e7eb',
                    color: 'white',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s'
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