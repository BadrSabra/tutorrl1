import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AppSettings, Level, LEVEL_NAMES_AR } from "@/lib/types";
import { Settings2, Globe, Palette, Brain, Target, Type } from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useLocalStorage<AppSettings>("tutorrl_settings", {
    language: "ar",
    learningStyle: "step-by-step",
    theme: "light",
    fontSize: "medium"
  });

  const [profile, setProfile] = useLocalStorage<any>("tutorrl_student_profile", null);
  const isAr = settings.language === "ar";

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Settings2 className="w-8 h-8 text-primary" />
          {isAr ? "الإعدادات" : "Settings"}
        </h1>
        <p className="text-muted-foreground">
          {isAr ? "قم بتخصيص تجربة التعلم الخاصة بك" : "Customize your learning experience"}
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="w-5 h-5 text-blue-500" />
              {isAr ? "اللغة" : "Language"}
            </CardTitle>
            <CardDescription>
              {isAr ? "لغة واجهة المستخدم والمحادثة" : "App and chat language"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={settings.language} 
              onValueChange={(v: "ar" | "en") => updateSetting("language", v)}
              className="flex flex-col space-y-3"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="ar" id="lang-ar" />
                <Label htmlFor="lang-ar" className="text-base cursor-pointer">العربية</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="en" id="lang-en" />
                <Label htmlFor="lang-en" className="text-base cursor-pointer">English</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="w-5 h-5 text-purple-500" />
              {isAr ? "المظهر" : "Theme"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={settings.theme} 
              onValueChange={(v: "light" | "dark" | "auto") => updateSetting("theme", v)}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {[
                { value: "light", label: isAr ? "فاتح" : "Light" },
                { value: "dark", label: isAr ? "داكن" : "Dark" },
                { value: "auto", label: isAr ? "تلقائي" : "Auto" },
              ].map(opt => (
                <div key={opt.value}>
                  <RadioGroupItem value={opt.value} id={`theme-${opt.value}`} className="peer sr-only" />
                  <Label
                    htmlFor={`theme-${opt.value}`}
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                  >
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Type className="w-5 h-5 text-indigo-500" />
              {isAr ? "حجم الخط" : "Font Size"}
            </CardTitle>
            <CardDescription>
              {isAr ? "اضبط حجم النص في جميع أنحاء التطبيق" : "Adjust text size throughout the app"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={settings.fontSize ?? "medium"}
              onValueChange={(v: "small" | "medium" | "large") => updateSetting("fontSize", v)}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { value: "small", label: isAr ? "صغير" : "Small", preview: "أ" },
                { value: "medium", label: isAr ? "متوسط" : "Medium", preview: "أ" },
                { value: "large", label: isAr ? "كبير" : "Large", preview: "أ" },
              ].map(opt => (
                <div key={opt.value}>
                  <RadioGroupItem value={opt.value} id={`font-${opt.value}`} className="peer sr-only" />
                  <Label
                    htmlFor={`font-${opt.value}`}
                    className="flex flex-col items-center gap-2 rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                  >
                    <span className={opt.value === "small" ? "text-sm" : opt.value === "large" ? "text-2xl" : "text-lg"}>
                      {opt.preview}
                    </span>
                    <span className="text-sm">{opt.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="w-5 h-5 text-amber-500" />
              {isAr ? "أسلوب التعلم" : "Learning Style"}
            </CardTitle>
            <CardDescription>
              {isAr ? "كيف تفضل أن يشرح لك المعلم الذكي؟" : "How do you prefer the tutor to explain?"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={settings.learningStyle} 
              onValueChange={(v: any) => updateSetting("learningStyle", v)}
            >
              <SelectTrigger className="w-full h-12 text-base">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="step-by-step">{isAr ? "خطوة بخطوة (موصى به)" : "Step-by-step (Recommended)"}</SelectItem>
                <SelectItem value="visual">{isAr ? "بصري (تخيل وأمثلة)" : "Visual (Examples & Imagery)"}</SelectItem>
                <SelectItem value="practical">{isAr ? "عملي (تطبيقات حياتية)" : "Practical (Real-world applications)"}</SelectItem>
                <SelectItem value="theoretical">{isAr ? "نظري (قوانين ونظريات)" : "Theoretical (Rules & Theories)"}</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-emerald-500" />
              {isAr ? "تجاوز المستوى" : "Level Override"}
            </CardTitle>
            <CardDescription>
              {isAr ? "تغيير مستواك يدوياً بدون اختبار تحديد مستوى" : "Manually change your level without a placement test"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={profile?.level || "beginner"} 
              onValueChange={(v: Level) => setProfile((prev: any) => ({ ...prev, level: v }))}
            >
              <SelectTrigger className="w-[200px] h-12 text-base">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">{isAr ? LEVEL_NAMES_AR["beginner"] : "Beginner"}</SelectItem>
                <SelectItem value="intermediate">{isAr ? LEVEL_NAMES_AR["intermediate"] : "Intermediate"}</SelectItem>
                <SelectItem value="advanced">{isAr ? LEVEL_NAMES_AR["advanced"] : "Advanced"}</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
