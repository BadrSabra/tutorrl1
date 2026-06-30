// @ts-nocheck
export type Subject = 'math' | 'physics' | 'chemistry' | 'biology';
export type Grade = '1sec' | '2sec' | '3sec';
export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  feedback?: 'like' | 'dislike';
}

export interface Session {
  id: string;
  subject: Subject;
  grade: Grade;
  level: Level;
  startTime: number;
  messages: Message[];
}

export interface StudentProfile {
  level: Level;
  strengths: string[];
  weaknesses: string[];
  recommendedTopics: string[];
  badges: { id: string; name: string; earnedAt: number }[];
}

export interface AppSettings {
  language: 'ar' | 'en';
  learningStyle: 'visual' | 'practical' | 'theoretical' | 'step-by-step';
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
}

export interface ArchivedSession extends Session {
  endTime: number;
}

export const SUBJECT_NAMES_AR: Record<Subject, string> = {
  math: 'الرياضيات',
  physics: 'الفيزياء',
  chemistry: 'الكيمياء',
  biology: 'الأحياء'
};

export const GRADE_NAMES_AR: Record<Grade, string> = {
  '1sec': 'الأول الثانوي',
  '2sec': 'الثاني الثانوي',
  '3sec': 'الثالث الثانوي'
};

export const LEVEL_NAMES_AR: Record<Level, string> = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم'
};

export interface Question {
  text: string;
  options: string[];
  correctIndex: number;
}

export const PLACEMENT_QUESTIONS: Record<Subject, Question[]> = {
  math: [
    { text: "ما هو ناتج 5 + 3 × 2؟", options: ["16", "11", "13", "10"], correctIndex: 1 },
    { text: "حل المعادلة: 2س + 3 = 11", options: ["س = 4", "س = 5", "س = 3", "س = 6"], correctIndex: 0 },
    { text: "ما هي مشتقة الدالة ص = س²؟", options: ["2س", "س²", "2", "س"], correctIndex: 0 },
    { text: "أوجد تكامل الدالة ص = 2س", options: ["س² + ث", "س²", "2س² + ث", "س + ث"], correctIndex: 0 },
    { text: "ما هو ميل المماس للمنحنى ص = س³ عند س = 2؟", options: ["12", "6", "8", "4"], correctIndex: 0 },
    { text: "أوجد التكامل المحدد: ∫₀¹ (2س) دس", options: ["1", "2", "0", "0.5"], correctIndex: 0 }
  ],
  physics: [
    { text: "ما وحدة قياس القوة؟", options: ["نيوتن", "جول", "واط", "باسكال"], correctIndex: 0 },
    { text: "السرعة تساوي:", options: ["المسافة / الزمن", "الزمن / المسافة", "الكتلة × العجلة", "القوة × المسافة"], correctIndex: 0 },
    { text: "ما هو تسارع الجاذبية الأرضية تقريباً؟", options: ["9.8 م/ث²", "10.5 م/ث²", "8.9 م/ث²", "9.0 م/ث²"], correctIndex: 0 },
    { text: "الطاقة الحركية لجسم تعتمد على:", options: ["الكتلة والسرعة", "الكتلة فقط", "السرعة فقط", "الكتلة والارتفاع"], correctIndex: 0 },
    { text: "قانون أوم يربط بين:", options: ["الجهد والتيار والمقاومة", "القوة والكتلة والعجلة", "الضغط والحجم والحرارة", "السرعة والزمن والمسافة"], correctIndex: 0 },
    { text: "أشعة الضوء هي عبارة عن:", options: ["موجات كهرومغناطيسية", "جسيمات مادية فقط", "موجات صوتية", "موجات ميكانيكية"], correctIndex: 0 }
  ],
  chemistry: [
    { text: "رمز عنصر الصوديوم هو:", options: ["Na", "N", "S", "So"], correctIndex: 0 },
    { text: "الرقم الهيدروجيني pH للماء النقي يساوي:", options: ["7", "0", "14", "1"], correctIndex: 0 },
    { text: "أصغر وحدة بناء للمادة هي:", options: ["الذرة", "الجزيء", "المركب", "الخلية"], correctIndex: 0 },
    { text: "تفاعل الحمض مع القاعدة ينتج:", options: ["ملح وماء", "غاز هيدروجين", "أكسجين", "حمض أقوى"], correctIndex: 0 },
    { text: "الغاز الذي يعكر ماء الجير الرائق هو:", options: ["ثاني أكسيد الكربون", "الأكسجين", "النيتروجين", "الهيدروجين"], correctIndex: 0 },
    { text: "العدد الذري لعنصر الكربون:", options: ["6", "12", "14", "8"], correctIndex: 0 }
  ],
  biology: [
    { text: "مركز التحكم في الخلية الحيوانية:", options: ["النواة", "الميتوكوندريا", "الريبوسوم", "الغشاء الخلوي"], correctIndex: 0 },
    { text: "الغاز الذي يستهلكه النبات في عملية البناء الضوئي:", options: ["ثاني أكسيد الكربون", "الأكسجين", "النيتروجين", "الهيليوم"], correctIndex: 0 },
    { text: "وحدة بناء الكائنات الحية هي:", options: ["الخلية", "النسيج", "العضو", "الجهاز"], correctIndex: 0 },
    { text: "أين يحدث التنفس الخلوي لإنتاج الطاقة؟", options: ["الميتوكوندريا", "البلاستيدات الخضراء", "النواة", "الفجوة العصارية"], correctIndex: 0 },
    { text: "يتم تخزين المعلومات الوراثية في:", options: ["DNA", "البروتينات", "الدهون", "الكربوهيدرات"], correctIndex: 0 },
    { text: "ما هو العضو المسؤول عن ضخ الدم في جسم الإنسان؟", options: ["القلب", "الرئتين", "الكبد", "الكليتين"], correctIndex: 0 }
  ]
};
