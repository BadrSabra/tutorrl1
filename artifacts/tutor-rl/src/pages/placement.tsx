import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAssessLevel } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { 
  Subject, Grade, AppSettings, PLACEMENT_QUESTIONS, 
  SUBJECT_NAMES_AR, GRADE_NAMES_AR 
} from "@/lib/types";
import { ArrowLeft, ArrowRight, BrainCircuit, CheckCircle2, Loader2 } from "lucide-react";

export default function Placement() {
  const [, setLocation] = useLocation();
  const [currentSubject] = useLocalStorage<Subject | null>("tutorrl_current_subject", null);
  const [currentGrade] = useLocalStorage<Grade | null>("tutorrl_current_grade", null);
  const [, setProfile] = useLocalStorage<any>("tutorrl_student_profile", null);
  const [settings] = useLocalStorage<AppSettings>("tutorrl_settings", {
    language: "ar",
    learningStyle: "step-by-step",
    theme: "light"
  });
  
  const isAr = settings.language === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const assessMutation = useAssessLevel();

  // Redirect if no subject/grade
  useEffect(() => {
    if (!currentSubject || !currentGrade) {
      setLocation("/subjects");
    }
  }, [currentSubject, currentGrade, setLocation]);

  if (!currentSubject || !currentGrade) return null;

  const questions = PLACEMENT_QUESTIONS[currentSubject];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsComplete(true);
      submitAssessment(newAnswers);
    }
  };

  const submitAssessment = (finalAnswers: number[]) => {
    assessMutation.mutate({
      data: {
        subject: currentSubject,
        grade: currentGrade,
        answers: finalAnswers
      }
    }, {
      onSuccess: (result) => {
        setProfile((prev: any) => ({
          ...prev,
          level: result.level,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          recommendedTopics: result.recommendedTopics,
          badges: prev?.badges || []
        }));
      }
    });
  };

  if (isComplete) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background animate-in fade-in duration-500">
        <div className="w-full max-w-md text-center space-y-6">
          {assessMutation.isPending ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <h2 className="text-2xl font-bold">
                {isAr ? "نقوم بتحليل إجاباتك..." : "Analyzing your answers..."}
              </h2>
              <p className="text-muted-foreground">
                {isAr ? "نصمم خطة دراسية مخصصة لك" : "Creating a personalized study plan for you"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {isAr ? "تم تحديد مستواك بنجاح!" : "Assessment Complete!"}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {isAr ? "نحن جاهزون الآن للبدء." : "We are ready to start now."}
                </p>
              </div>
              <Button size="lg" className="w-full h-14 text-lg mt-4" onClick={() => setLocation("/chat")}>
                {isAr ? "ابدأ الدرس" : "Start Lesson"}
                <ArrowIcon className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-6 md:p-8 pb-24 md:pb-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-primary" />
            {isAr ? "تحديد المستوى" : "Placement Test"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAr ? SUBJECT_NAMES_AR[currentSubject] : currentSubject} - {isAr ? GRADE_NAMES_AR[currentGrade] : currentGrade}
          </p>
        </div>
        <div className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
          {currentQuestionIndex + 1} / {questions.length}
        </div>
      </div>

      <Progress value={progress} className="h-2 mb-10" />

      <Card className="border-2 shadow-sm">
        <CardContent className="p-6 md:p-10 flex flex-col min-h-[300px]">
          <h2 className="text-2xl font-semibold mb-8 leading-snug">
            {currentQuestion.text}
          </h2>

          <div className="grid grid-cols-1 gap-3 mt-auto">
            {currentQuestion.options.map((opt, i) => (
              <Button
                key={i}
                variant="outline"
                className="h-16 text-lg justify-start px-6 font-normal whitespace-normal text-start"
                onClick={() => handleAnswer(i)}
              >
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center mr-4 rtl:ml-4 rtl:mr-0 text-muted-foreground font-semibold">
                  {i + 1}
                </div>
                {opt}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
