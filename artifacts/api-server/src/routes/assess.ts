// @ts-nocheck
// @ts-nocheck
// @ts-nocheck
import { Router } from "express";
import { AssessLevelBody } from "@workspace/api-zod";

const router = Router();

// Placement test answer keys per subject (2 beginner, 2 intermediate, 2 advanced)
const ANSWER_KEYS: Record<string, { correct: number; level: string; topic: string }[]> = {
  math: [
    { correct: 1, level: "beginner", topic: "العمليات الأساسية" },
    { correct: 0, level: "beginner", topic: "المعادلات الخطية" },
    { correct: 0, level: "intermediate", topic: "التفاضل" },
    { correct: 0, level: "intermediate", topic: "التكامل" },
    { correct: 0, level: "advanced", topic: "التفاضل المتقدم" },
    { correct: 0, level: "advanced", topic: "التكامل المتقدم" },
  ],
  physics: [
    { correct: 0, level: "beginner", topic: "الحركة والقوة" },
    { correct: 1, level: "beginner", topic: "الطاقة" },
    { correct: 2, level: "intermediate", topic: "الكهرباء" },
    { correct: 1, level: "intermediate", topic: "المغناطيسية" },
    { correct: 0, level: "advanced", topic: "الفيزياء الحديثة" },
    { correct: 3, level: "advanced", topic: "الموجات" },
  ],
  chemistry: [
    { correct: 2, level: "beginner", topic: "الذرة والجزيء" },
    { correct: 0, level: "beginner", topic: "العناصر والمركبات" },
    { correct: 1, level: "intermediate", topic: "التفاعلات الكيميائية" },
    { correct: 3, level: "intermediate", topic: "الجدول الدوري" },
    { correct: 0, level: "advanced", topic: "الكيمياء التحليلية" },
    { correct: 2, level: "advanced", topic: "البوليمرات" },
  ],
  biology: [
    { correct: 1, level: "beginner", topic: "الخلية والأنسجة" },
    { correct: 0, level: "beginner", topic: "الأعضاء والأجهزة" },
    { correct: 2, level: "intermediate", topic: "الجهاز العصبي" },
    { correct: 3, level: "intermediate", topic: "الهرمونات" },
    { correct: 0, level: "advanced", topic: "الوراثة" },
    { correct: 1, level: "advanced", topic: "التطور والبيئة" },
  ],
};

router.post("/assess", (req, res) => {
  const parsed = AssessLevelBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { subject, answers } = parsed.data;
  const test = ANSWER_KEYS[subject];

  if (!test) {
    res.status(400).json({ error: "Unknown subject" });
    return;
  }

  let correctCount = 0;
  let beginnerCorrect = 0;
  let intermediateCorrect = 0;
  let advancedCorrect = 0;

  for (let i = 0; i < Math.min(test.length, answers.length); i++) {
    const isCorrect = answers[i] === test[i].correct;
    if (isCorrect) {
      correctCount++;
      if (test[i].level === "beginner") beginnerCorrect++;
      else if (test[i].level === "intermediate") intermediateCorrect++;
      else advancedCorrect++;
    }
  }

  let level: "beginner" | "intermediate" | "advanced" = "beginner";
  if (correctCount >= 5) level = "advanced";
  else if (correctCount >= 3) level = "intermediate";

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendedTopics: string[] = [];

  if (beginnerCorrect >= 2) {
    strengths.push("أساسيات المادة");
  } else {
    weaknesses.push("أساسيات المادة");
    test.filter((q) => q.level === "beginner").forEach((q) => recommendedTopics.push(q.topic));
  }

  if (level !== "beginner") {
    if (intermediateCorrect >= 2) {
      strengths.push("مفاهيم متوسطة");
    } else {
      weaknesses.push("مفاهيم متوسطة");
      test.filter((q) => q.level === "intermediate").forEach((q) => recommendedTopics.push(q.topic));
    }
  }

  if (level === "advanced") {
    if (advancedCorrect >= 2) {
      strengths.push("مفاهيم متقدمة");
    } else {
      weaknesses.push("مفاهيم متقدمة");
      test.filter((q) => q.level === "advanced").forEach((q) => recommendedTopics.push(q.topic));
    }
  }

  req.log.info({ subject, level, correctCount }, "Assessment completed");
  res.json({ level, strengths, weaknesses, recommendedTopics });
});

export default router;
