import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Atom, FlaskConical, Dna, ArrowLeft, ArrowRight } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Subject, Grade, AppSettings, SUBJECT_NAMES_AR, GRADE_NAMES_AR } from "@/lib/types";

export default function Subjects() {
  const [, setLocation] = useLocation();
  const [settings] = useLocalStorage<AppSettings>("tutorrl_settings", {
    language: "ar",
    learningStyle: "step-by-step",
    theme: "light"
  });
  const isAr = settings.language === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

  const [, setCurrentSubject] = useLocalStorage<Subject | null>("tutorrl_current_subject", null);
  const [, setCurrentGrade] = useLocalStorage<Grade | null>("tutorrl_current_grade", null);
  const [profile] = useLocalStorage<any>("tutorrl_student_profile", null);

  const subjects: { id: Subject; icon: any; color: string }[] = [
    { id: "math", icon: Calculator, color: "text-blue-500 bg-blue-500/10" },
    { id: "physics", icon: Atom, color: "text-amber-500 bg-amber-500/10" },
    { id: "chemistry", icon: FlaskConical, color: "text-emerald-500 bg-emerald-500/10" },
    { id: "biology", icon: Dna, color: "text-rose-500 bg-rose-500/10" },
  ];

  const grades: Grade[] = ["1sec", "2sec", "3sec"];

  const handleContinue = () => {
    if (selectedSubject && selectedGrade) {
      setCurrentSubject(selectedSubject);
      setCurrentGrade(selectedGrade);
      
      // If we don't have a level assessment yet, or need a fresh one for this subject, go to placement
      if (!profile || !profile.level) {
        setLocation("/placement");
      } else {
        setLocation("/chat");
      }
    }
  };

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8 max-w-4xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isAr ? "ماذا سندرس اليوم؟" : "What are we studying today?"}
        </h1>
        <p className="text-muted-foreground">
          {isAr ? "اختر المادة والسنة الدراسية لنبدأ جلستنا." : "Select subject and grade to begin our session."}
        </p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isAr ? "المادة" : "Subject"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {subjects.map((s) => (
              <Card 
                key={s.id}
                className={`cursor-pointer transition-all hover-elevate ${
                  selectedSubject === s.id 
                    ? "ring-2 ring-primary border-primary bg-primary/5" 
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedSubject(s.id)}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
                  <div className={`p-4 rounded-2xl ${s.color}`}>
                    <s.icon className="w-8 h-8" />
                  </div>
                  <span className="font-semibold text-lg">
                    {isAr ? SUBJECT_NAMES_AR[s.id] : s.id}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isAr ? "السنة الدراسية" : "Grade"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {grades.map((g) => (
              <Card 
                key={g}
                className={`cursor-pointer transition-all hover-elevate ${
                  selectedGrade === g 
                    ? "ring-2 ring-primary border-primary bg-primary/5" 
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedGrade(g)}
              >
                <CardContent className="p-5 flex items-center justify-center">
                  <span className="font-semibold text-lg">
                    {isAr ? GRADE_NAMES_AR[g] : g}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="flex justify-end pt-6 border-t">
          <Button 
            size="lg" 
            className="px-8 h-12 text-lg"
            disabled={!selectedSubject || !selectedGrade}
            onClick={handleContinue}
          >
            {isAr ? "متابعة" : "Continue"}
            <ArrowIcon className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" />
          </Button>
        </div>
      </div>
    </div>
  );
}
