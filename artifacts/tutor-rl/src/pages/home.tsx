import { Link, useLocation } from "wouter";
import { GraduationCap, ArrowLeft, ArrowRight, Play, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Session, AppSettings } from "@/lib/types";

export default function Home() {
  const [, setLocation] = useLocation();
  const [currentSession] = useLocalStorage<Session | null>("tutorrl_current_session", null);
  const [settings] = useLocalStorage<AppSettings>("tutorrl_settings", {
    language: "ar",
    learningStyle: "step-by-step",
    theme: "light"
  });

  const isAr = settings.language === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md flex flex-col items-center text-center z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
          <GraduationCap className="w-12 h-12 text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold text-foreground mb-4">
          {isAr ? "مرحباً بك في TutorRL" : "Welcome to TutorRL"}
        </h1>
        
        <p className="text-lg text-muted-foreground mb-10 max-w-sm leading-relaxed">
          {isAr 
            ? "رفيقك الذكي في رحلة الثانوية العامة. جاهز لمساعدتك في فهم أصعب الدروس وحل أعقد المسائل."
            : "Your smart companion for high school. Ready to help you understand the hardest lessons."}
        </p>

        <div className="flex flex-col gap-4 w-full">
          {currentSession && (
            <Button 
              size="lg" 
              className="w-full text-lg h-14 bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-secondary-border"
              onClick={() => setLocation("/chat")}
            >
              <Play className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
              {isAr ? "استمر في الجلسة" : "Continue Session"}
            </Button>
          )}

          <Button 
            size="lg" 
            className="w-full text-lg h-14"
            onClick={() => setLocation("/subjects")}
          >
            <BookOpen className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
            {isAr ? "ابدأ دراسة جديدة" : "Start New Study"}
            <ArrowIcon className="w-5 h-5 ml-auto rtl:mr-auto rtl:ml-0" />
          </Button>
        </div>
      </div>
    </div>
  );
}
