import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AppSettings, LEVEL_NAMES_AR } from "@/lib/types";
import { Award, BrainCircuit, Target, TrendingUp, Zap } from "lucide-react";

export default function Progress() {
  const [profile] = useLocalStorage<any>("tutorrl_student_profile", null);
  const [settings] = useLocalStorage<AppSettings>("tutorrl_settings", {
    language: "ar",
    learningStyle: "step-by-step",
    theme: "light"
  });

  const isAr = settings.language === "ar";

  if (!profile) {
    return (
      <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <Target className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {isAr ? "لا توجد بيانات بعد" : "No data yet"}
        </h2>
        <p className="text-muted-foreground">
          {isAr 
            ? "قم بإجراء اختبار تحديد المستوى أو ابدأ جلسة دراسية لرؤية تقدمك هنا."
            : "Take a placement test or start a study session to see your progress here."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {isAr ? "مستوى التقدم" : "Progress"}
        </h1>
        <p className="text-muted-foreground">
          {isAr ? "نظرة عامة على أدائك ومستواك الحالي" : "Overview of your performance and current level"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-primary-foreground shadow-lg border-primary">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <p className="text-primary-foreground/80 font-medium">
                {isAr ? "المستوى الحالي" : "Current Level"}
              </p>
              <h3 className="text-2xl font-bold">
                {isAr ? LEVEL_NAMES_AR[profile.level as keyof typeof LEVEL_NAMES_AR] : profile.level}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 shadow-sm border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-accent" />
              {isAr ? "المواضيع الموصى بها" : "Recommended Topics"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.recommendedTopics?.length > 0 ? (
                profile.recommendedTopics.map((topic: string, i: number) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm rounded-lg">
                    {topic}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  {isAr ? "استمر في الدراسة لتلقي توصيات" : "Keep studying to receive recommendations"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-500">
              <Zap className="w-5 h-5" />
              {isAr ? "نقاط القوة" : "Strengths"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {profile.strengths?.length > 0 ? (
                profile.strengths.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  {isAr ? "غير محدد بعد" : "Not determined yet"}
                </p>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <Target className="w-5 h-5" />
              {isAr ? "نقاط تحتاج للتحسين" : "Areas for Improvement"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {profile.weaknesses?.length > 0 ? (
                profile.weaknesses.map((w: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{w}</span>
                  </li>
                ))
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  {isAr ? "غير محدد بعد" : "Not determined yet"}
                </p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-500">
            <Award className="w-5 h-5" />
            {isAr ? "الأوسمة والإنجازات" : "Badges & Achievements"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profile.badges?.length > 0 ? (
              profile.badges.map((b: any, i: number) => (
                <div key={i} className="flex flex-col items-center p-4 bg-secondary rounded-xl text-center gap-2 border">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shadow-sm">
                    <Award className="w-6 h-6 text-purple-500" />
                  </div>
                  <span className="font-medium text-sm mt-1">{b.name}</span>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 opacity-50">
                  <Award className="w-6 h-6" />
                </div>
                <p>{isAr ? "أكمل الدروس لربح الأوسمة!" : "Complete lessons to earn badges!"}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
