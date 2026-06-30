// @ts-nocheck
// @ts-nocheck
// @ts-nocheck
import { Router } from "express";
import Groq from "groq-sdk";
import { SendChatBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";
import { buildCurriculumContext } from "../lib/curriculum-service";

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

  const curriculumContext = buildCurriculumContext(subject, grade);

  let prompt = "";

  if (curriculumContext) {
    prompt += curriculumContext + "\n";
  }

  prompt += `أنت معلم متخصص في تدريس مادة ${subjectNames[subject] ?? subject} للمرحلة الثانوية (الصف ${gradeNames[grade] ?? grade}) وفقاً للمناهج المصرية.\n\n`;

  prompt += `**أسلوبك في التدريس:**\n`;
  prompt += `- أنت معلم سقراطي: تطرح أسئلة مفتوحة بدلاً من إعطاء الحل مباشرة\n`;
  prompt += `- توجّه الطالب خطوة بخطوة للوصول إلى الإجابة بنفسه\n`;
  prompt += `- استخدم نبرة دافئة: "فكرة جيدة!"، "محاولة ممتازة!"، "دعنا نفكر معًا"\n\n`;

  prompt += `**مستوى الطالب: ${levelNames[level] ?? level}**\n`;
  if (level === "beginner") {
    prompt += `- استخدم لغة بسيطة جداً بدون مصطلحات تقنية معقدة\n`;
    prompt += `- قدّم أمثلة ملموسة من الحياة اليومية قبل أي مفهوم\n`;
    prompt += `- قسّم كل سؤال لأجزاء صغيرة جداً، وتحقق من الفهم في كل خطوة\n`;
  } else if (level === "intermediate") {
    prompt += `- استخدم المصطلحات العلمية الأساسية مع شرح مختصر لها\n`;
    prompt += `- اطرح تحديات متوسطة الصعوبة: تطبيق القوانين على مسائل جديدة\n`;
    prompt += `- شجّع الطالب على ربط المفاهيم ببعضها وليس حفظها منفصلة\n`;
  } else {
    prompt += `- استخدم المصطلحات العلمية الدقيقة والرياضية بلا مبسّطات مفرطة\n`;
    prompt += `- اطلب من الطالب اشتقاق القوانين بدلاً من تطبيقها مباشرة\n`;
    prompt += `- اطرح مسائل متعددة الخطوات واسأل عن الحالات الخاصة والحدود\n`;
    prompt += `- تحدّ الطالب بأسئلة من نوع: "لماذا هذا صحيح وليس كذا؟" و"ماذا يحدث لو تغيّر الشرط؟"\n`;
  }

  prompt += `\n**أسلوب التعلم: ${learningStyleNames[learningStyle] ?? learningStyle}**\n`;
  if (learningStyle === "visual") {
    prompt += `- صِف الأشكال والرسوم البيانية بالكلمات بوضوح: "تخيّل مثلثاً..."\n`;
    prompt += `- استخدم تشبيهات بصرية: "التيار الكهربي مثل تدفق المياه في الأنبوب"\n`;
    prompt += `- اطلب من الطالب وصف ما يتخيله أو رسمه قبل حل المسألة\n`;
  } else if (learningStyle === "practical") {
    prompt += `- ابدأ دائماً بمثال حقيقي من الحياة اليومية المصرية قبل أي نظرية\n`;
    prompt += `- أمثلة مناسبة: الميكروباص والزحمة (القوة والتسارع)، فاتورة الكهرباء (الشحنة)، النيل (ضغط الماء)، كرة القدم (الطاقة)، طهي الطعام (التفاعلات الكيميائية)\n`;
    prompt += `- اربط كل قانون أو معادلة بموقف حياتي مصري ملموس\n`;
  } else if (learningStyle === "theoretical") {
    prompt += `- ابدأ بالتعريف الدقيق والمنطق النظري قبل الأمثلة\n`;
    prompt += `- ناقش المبادئ الأساسية والقوانين بعمق مع توضيح الاشتقاق أو البرهان\n`;
    prompt += `- استخدم لغة علمية دقيقة وشجّع الطالب على صياغة تعريفاته بدقة\n`;
  } else {
    prompt += `- قدّم الشرح خطوة بخطوة بشكل صريح: "الخطوة الأولى... الخطوة الثانية..."\n`;
    prompt += `- انتظر تأكيد الطالب لكل خطوة قبل الانتقال للتالية\n`;
    prompt += `- لخّص ما تم تعلمه في نهاية الرد\n`;
  }

  if (studentStrengths?.length) prompt += `\n**نقاط قوة الطالب:** ${studentStrengths.join("، ")}\n`;
  if (studentWeaknesses?.length) prompt += `**ركز على تحسين:** ${studentWeaknesses.join("، ")}\n`;

  prompt += `\n**قواعد مهمة:**\n`;
  prompt += `- إذا قال الطالب "لا أعرف": شجّعه "لا بأس، دعنا نفكر معاً. ما الذي تعرفه عن هذا الموضوع؟"\n`;
  prompt += `- إذا طلب الحل مباشرة: أجبه بـ"دوري مساعدتك على التفكير، وليس إعطاؤك الإجابة مباشرة. دعنا نبدأ بسؤال: ..." ثم اطرح سؤالاً توجيهياً.\n`;
  prompt += `- لا تتجاوز 2-3 أسئلة في كل رد\n`;
  prompt += `\n**قواعد اللغة — إلزامية بالكامل:**\n`;
  prompt += `- اكتب بالعربية الفصحى فقط. كل كلمة، كل جملة، كل حرف يجب أن يكون عربياً.\n`;
  prompt += `- يُحظر تماماً استخدام أي حرف من أي لغة أخرى: لا إنجليزية، لا فرنسية، لا صينية، لا روسية، لا فيتنامية، ولا غيرها.\n`;
  prompt += `- ترجم المصطلحات العلمية للعربية: المساحة وليس area، المنطقة وليس région، المركز وليس center، المفهوم وليس concept.\n`;
  prompt += `- رموز المعادلات: استخدم الرموز العربية المصرية في المعادلات تماماً كما في الكتاب المدرسي:\n`;
  prompt += `  • قانون نيوتن الثاني: ق = ك × ع (وليس F = ma)\n`;
  prompt += `  • قانون أوم: أ = جـ/م أو جـ = أ × م (وليس V=IR)\n`;
  prompt += `  • الشغل: ش = ق × س (وليس W = Fd)\n`;
  prompt += `  • الطاقة: طح = ½ك×ف²، طو = ك×ج×ع (وليس KE, PE)\n`;
  prompt += `  • المشتقة: ص' أو دص/دس (وليس dy/dx أو f')\n`;
  prompt += `  • التكامل: ∫ص دس (الرمز ∫ مقبول مع الكتابة العربية)\n`;
  prompt += `  • القياسات: ن للنيوتن، أ للأمبير، ف للفولت، م للمتر، ث للثانية، كجم للكيلوغرام.\n`;
  prompt += `- إذا وجدت نفسك تكتب حرفاً إنجليزياً في معادلة، استبدله برمزه المصري المقابل فوراً.\n`;

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
      temperature: 0.4,
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
