import { Router } from "express";
import Groq from "groq-sdk";
import { SendChatBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router = Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const subjectNames: Record<string, string> = {
  math: "الرياضيات",
  physics: "الفيزياء",
  chemistry: "الكيمياء",
  biology: "الأحياء",
};

const gradeNames: Record<string, string> = {
  "1sec": "الأول الثانوي",
  "2sec": "الثاني الثانوي",
  "3sec": "الثالث الثانوي",
};

const levelNames: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

const learningStyleNames: Record<string, string> = {
  visual: "بصري",
  practical: "عملي",
  theoretical: "نظري",
  "step-by-step": "خطوة بخطوة",
};

function buildSystemPrompt(params: {
  subject: string;
  grade: string;
  level: string;
  language: string;
  learningStyle: string;
  studentStrengths?: string[];
  studentWeaknesses?: string[];
}): string {
  const { subject, grade, level, language, learningStyle, studentStrengths, studentWeaknesses } = params;

  if (language === "en") {
    return `You are an expert tutor for Egyptian high school students, specializing in ${subject} for grade ${grade}.
Teaching approach: Socratic method — guide students to discover answers through questions, never give direct solutions.
Student level: ${level}. Learning style: ${learningStyle}.
${studentStrengths?.length ? `Student strengths: ${studentStrengths.join(", ")}.` : ""}
${studentWeaknesses?.length ? `Focus on improving: ${studentWeaknesses.join(", ")}.` : ""}

Rules:
- Ask open-ended questions to guide thinking
- Give constructive feedback: praise first, then gently correct, then guide
- If student says "I don't know", respond: "No problem, let's think together. What do you know about this topic?"
- If student asks for direct answer, politely decline: "My role is to guide your thinking. Let's work through it step by step."
- Keep responses concise (2-3 questions max per reply)
- Use warm, encouraging tone: "Great idea!", "Excellent attempt!", "Let's think together"`;
  }

  let prompt = `أنت معلم متخصص في تدريس مادة ${subjectNames[subject] ?? subject} للمرحلة الثانوية (الصف ${gradeNames[grade] ?? grade}) وفقاً للمناهج المصرية.\n\n`;

  prompt += `**أسلوبك في التدريس:**\n`;
  prompt += `- أنت معلم سقراطي: تطرح أسئلة مفتوحة بدلاً من إعطاء الحل مباشرة\n`;
  prompt += `- توجّه الطالب خطوة بخطوة للوصول إلى الإجابة بنفسه\n`;
  prompt += `- استخدم نبرة دافئة: "فكرة جيدة!"، "محاولة ممتازة!"، "دعنا نفكر معًا"\n\n`;

  prompt += `**مستوى الطالب: ${levelNames[level] ?? level}**\n`;
  if (level === "beginner") prompt += `- استخدم لغة بسيطة وأمثلة ملموسة من الحياة اليومية\n`;
  else if (level === "intermediate") prompt += `- استخدم لغة واضحة مع تحديات مناسبة\n`;
  else prompt += `- استخدم مصطلحات دقيقة وأسئلة تحفز التفكير النقدي\n`;

  prompt += `\n**أسلوب التعلم: ${learningStyleNames[learningStyle] ?? learningStyle}**\n`;
  if (learningStyle === "visual") prompt += `- استخدم تشبيهات بصرية ووصف الأشكال بوضوح\n`;
  else if (learningStyle === "practical") prompt += `- استخدم أمثلة من الحياة اليومية المصرية\n`;
  else if (learningStyle === "theoretical") prompt += `- قدم المفاهيم النظرية والقوانين بعمق\n`;
  else prompt += `- قدم شرحاً خطوة بخطوة\n`;

  if (studentStrengths?.length) prompt += `\n**نقاط قوة الطالب:** ${studentStrengths.join("، ")}\n`;
  if (studentWeaknesses?.length) prompt += `**ركز على تحسين:** ${studentWeaknesses.join("، ")}\n`;

  prompt += `\n**قواعد مهمة:**\n`;
  prompt += `- إذا قال الطالب "لا أعرف": شجّعه "لا بأس، دعنا نفكر معاً. ما الذي تعرفه عن هذا الموضوع؟"\n`;
  prompt += `- إذا طلب الحل مباشرة: "دوري مساعدتك على التفكير. دعنا نبدأ خطوة بخطوة."\n`;
  prompt += `- لا تتجاوز 2-3 أسئلة في كل رد\n`;

  return prompt;
}

router.post("/chat", async (req, res) => {
  const parsed = SendChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { messages, subject, grade, level, language, learningStyle, studentStrengths, studentWeaknesses } = parsed.data;

  const systemPrompt = buildSystemPrompt({
    subject,
    grade,
    level,
    language,
    learningStyle,
    studentStrengths: studentStrengths ?? [],
    studentWeaknesses: studentWeaknesses ?? [],
  });

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    req.log.info({ subject, grade, level }, "Chat response generated");
    res.json({ content, messageId });
  } catch (err) {
    logger.error({ err }, "Groq API error");
    res.status(500).json({ error: "AI service error. Please try again." });
  }
});

export default router;
