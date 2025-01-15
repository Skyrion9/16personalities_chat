"use client";

import { useState } from "react";
import Link from "next/link";
import {
  assessment,
  AssessmentQuestion,
  traitDescriptions,
} from "@/app/data/bigFiveAssessment";

//the scores from https://ipip.ori.org/new_ipip-50-item-scale.htm are used

interface Question extends AssessmentQuestion {
  id: number;
}

const questions: Question[] = assessment.map((q, index) => ({
  ...q,
  id: index + 1,
}));

export default function BigFive() {
  // Add this trait order definition
  const traitOrder = [
    { number: 1, name: "Extraversion" },
    { number: 4, name: "Emotional Stability" },
    { number: 2, name: "Agreeableness" },
    { number: 3, name: "Conscientiousness" },
    { number: 5, name: "Intellect/Imagination" },
  ];

  // Initialize with empty answers instead of all 5s
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});

  // Start with showResults as false
  const [showResults, setShowResults] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);

  // Initialize with empty scores
  const [scores, setScores] = useState<{ [key: number]: number }>({});

  const questionsPerPage = 5;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const currentQuestions = questions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  const calculateScores = () => {
    // Initialize scores for each trait type
    const typeScores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    // Log each question's details
    console.log("Question Details:");
    questions.forEach((question) => {
      const answer = answers[question.id];
      if (answer !== undefined) {
        const score = question.math === "+" ? answer : 5 - (answer - 1);

        console.log({
          questionId: question.id,
          question: question.question,
          userAnswer: answer,
          calculatedScore: score,
          traitType: question.type,
          mathType: question.math,
        });

        typeScores[question.type] += score;
      }
    });

    // Log final trait scores
    console.log("Final Trait Scores:", typeScores);

    setScores(typeScores);
    setShowResults(true);
  };

  const calculateRunningScores = () => {
    const runningScores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    questions.forEach((question, index) => {
      const answer = answers[index + 1];
      if (answer !== undefined) {
        // For + keyed items: use value directly (1,2,3,4,5)
        // For - keyed items: reverse the value (5,4,3,2,1)
        const score = question.math === "+" ? answer : 6 - answer;

        runningScores[question.type] += score;
      }
    });

    return runningScores;
  };

  const handleAnswer = (questionId: number, value: number) => {
    //get the value from my data
    const question = questions.find((q) => q.id === questionId);
    //calculate the score
    const score = question?.math === "+" ? value : 6 - value;
    //store the id of the question, value of the user and the score
    const questionPoints = {
      id: questionId,
      value: value,
      score: score,
    };
    //next we need to make the store the value
    setAnswers((prev) => {
      const newAnswers = { ...prev, [questionId]: value };
      return newAnswers;
    });

    setAnswers((prev) => {
      const newAnswers = { ...prev, [questionId]: value };

      const currentQuestion = questions.find((q) => q.id === questionId);
      if (currentQuestion) {
        const score = currentQuestion.math === "+" ? value : 6 - value;
        const scores = calculateRunningScores();
      }
      // console.log("newAnswers", newAnswers);
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const isPageComplete = () => {
    return currentQuestions.every((q) => answers[q.id] !== undefined);
  };

  const isLastPage = currentPage === totalPages - 1;

  // Add this function to determine MBTI compatibility based on Big Five scores
  const getMBTICompatibility = (scores: { [key: number]: number }) => {
    // Middle point is 30 (average of min 10 and max 50)
    const MIDDLE_SCORE = 30;

    const preferences = {
      E: scores[1] > MIDDLE_SCORE, // Extraversion vs Introversion
      F: scores[2] > MIDDLE_SCORE, // Feeling vs Thinking
      J: scores[3] > MIDDLE_SCORE, // Judging vs Perceiving
      N: scores[5] > MIDDLE_SCORE, // Intuition vs Sensing
    };

    const types = [];

    // Helper function to count matching preferences
    const countMatches = (type: string) => {
      let matches = 0;
      if (
        (type.includes("E") && preferences.E) ||
        (type.includes("I") && !preferences.E)
      )
        matches++;
      if (
        (type.includes("N") && preferences.N) ||
        (type.includes("S") && !preferences.N)
      )
        matches++;
      if (
        (type.includes("F") && preferences.F) ||
        (type.includes("T") && !preferences.F)
      )
        matches++;
      if (
        (type.includes("J") && preferences.J) ||
        (type.includes("P") && !preferences.J)
      )
        matches++;
      return matches;
    };

    // All possible MBTI types
    const allTypes = [
      "ENFJ",
      "ENFP",
      "ENTJ",
      "ENTP",
      "ESFJ",
      "ESFP",
      "ESTJ",
      "ESTP",
      "INFJ",
      "INFP",
      "INTJ",
      "INTP",
      "ISFJ",
      "ISFP",
      "ISTJ",
      "ISTP",
    ];

    // Add types that match at least 2 preferences
    allTypes.forEach((type) => {
      if (countMatches(type) >= 2) {
        types.push(type);
      }
    });

    return types;
  };

  const renderResults = () => {
    if (!showResults) return null;

    const MIDDLE_SCORE = 30;
    const getLevel = (score: number) => (score > MIDDLE_SCORE ? "High" : "Low");

    const compatibleTypes = getMBTICompatibility(scores);

    return (
      <div className="bg-muted/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Your Results</h2>

        <p className="text-muted-foreground mb-8 text-center">
          Your Big Five personality assessment results are shown below. Each
          trait is scored on a scale from 10 to 50, where 10 represents the
          lowest possible score and 50 represents the highest possible score.
        </p>

        <div className="space-y-8">
          {traitOrder.map(({ number, name }) => (
            <div key={number} className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{name}</h3>
                <span className="text-sm font-medium">
                  Score: {scores[number]} ({getLevel(scores[number])})
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{
                    width: `${Math.max(
                      ((scores[number] - 10) / 40) * 100,
                      0
                    )}%`,
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {traitDescriptions[number].description}
              </p>
            </div>
          ))}
        </div>

        {/* Compatible Types Section */}
        <div className="mt-12 border-t pt-8">
          <h3 className="text-xl font-semibold text-center mb-4">
            Compatible MBTI Types
          </h3>
          <p className="text-muted-foreground text-center mb-6">
            This MBTI types scored in at least 2 categories in the same way
            (high or low) as you:
          </p>
          <div className="flex flex-col items-center gap-4">
            {compatibleTypes.map((type, index) => (
              <div key={index} className="text-lg font-medium">
                {type}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <span>Chat with similar Types</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-2 h-4 w-4"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Go to MBTI Characters Chat
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-3">Big Five Personality Test</h1>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Discover your personality traits through this scientific
              assessment
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Takes 5 minutes
              </div>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
                No registration required
              </div>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                100% Free
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {!showResults ? (
            <div className="space-y-8">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <span className="text-sm text-muted-foreground">
                  {questions.length} questions total
                </span>
              </div>

              {currentQuestions.map((question) => (
                <div key={question.id} className="space-y-4 sm:space-y-6">
                  <h3 className="text-base sm:text-lg font-medium text-center max-w-2xl mx-auto px-4">
                    {question.question}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between max-w-xl mx-auto px-4">
                      <span className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-0 sm:min-w-[100px] sm:text-right">
                        Strongly Disagree
                      </span>
                      <div className="flex gap-2 sm:gap-3">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            onClick={() => handleAnswer(question.id, value)}
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors text-sm sm:text-base
                              ${
                                answers[question.id] === value
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-background hover:bg-muted border"
                              }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                      <span className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-0 sm:min-w-[100px] sm:text-left">
                        Strongly Agree
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center pt-8 px-4">
                <button
                  onClick={handlePrevious}
                  className={`px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition-opacity
                    ${
                      currentPage > 0
                        ? "bg-secondary text-secondary-foreground hover:opacity-90"
                        : "invisible"
                    }`}
                >
                  Previous
                </button>

                {isLastPage ? (
                  <button
                    onClick={calculateScores}
                    disabled={!isPageComplete()}
                    className={`bg-primary text-primary-foreground px-6 sm:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-opacity
                      ${
                        isPageComplete()
                          ? "hover:opacity-90"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                  >
                    See Results
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!isPageComplete()}
                    className={`bg-primary text-primary-foreground px-6 sm:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-opacity
                      ${
                        isPageComplete()
                          ? "hover:opacity-90"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          ) : (
            renderResults()
          )}
        </div>
      </main>

      <footer className="border-t">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="text-sm text-muted-foreground text-center">
            Based on the scientific Big Five personality model
          </p>
        </div>
      </footer>
    </div>
  );
}
