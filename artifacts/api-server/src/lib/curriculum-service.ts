// @ts-nocheck
// @ts-nocheck
import path from "path";
import fs from "fs";

interface CurriculumLesson {
  id: string;
  name: string;
  topics: string[];
  egyptianTerms?: string[];
  keyRules?: string[];
  egyptianExamples?: string[];
  sampleQuestions?: string[];
}

interface CurriculumUnit {
  id: string;
  name: string;
  lessons: CurriculumLesson[];
}

interface CurriculumData {
  subject: string;
  grade: string;
  gradeName: string;
  units: CurriculumUnit[];
}

interface Term {
  term: string;
  altTerms?: string[];
  grade: string;
  definition: string;
  notation?: string;
  unit?: string;
}

interface TermsData {
  subject: string;
  terms: Term[];
}

const dataDir = path.join(__dirname, "../data/egyptian_curriculum");

function loadCurriculum(subject: string, grade: string): CurriculumData | null {
  try {
    const filePath = path.join(dataDir, subject, `${grade}.json`);
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as CurriculumData;
  } catch {
    return null;
  }
}

function loadTerms(subject: string): TermsData | null {
  try {
    const filePath = path.join(dataDir, "terms", `${subject}_terms.json`);
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as TermsData;
  } catch {
    return null;
  }
}

export function buildCurriculumContext(subject: string, grade: string): string {
  const curriculum = loadCurriculum(subject, grade);
  const termsData = loadTerms(subject);

  if (!curriculum && !termsData) return "";

  let context = `\n**سياق المنهج المصري — ${curriculum?.gradeName ?? grade}:**\n`;

  if (curriculum) {
    context += `\n📚 وحدات المنهج الدراسي:\n`;
    for (const unit of curriculum.units) {
      context += `• ${unit.name}\n`;
      for (const lesson of unit.lessons) {
        context += `  - ${lesson.name}\n`;
        if (lesson.egyptianTerms?.length) {
          context += `    المصطلحات المصرية: ${lesson.egyptianTerms.slice(0, 5).join("، ")}\n`;
        }
        if (lesson.keyRules?.length) {
          context += `    قواعد أساسية: ${lesson.keyRules.slice(0, 3).join(" | ")}\n`;
        }
      }
    }
  }

  if (termsData) {
    const gradeTerms = termsData.terms.filter((t) => t.grade === grade);
    if (gradeTerms.length > 0) {
      context += `\n📖 مصطلحات هذا الصف (${curriculum?.gradeName ?? grade}):\n`;
      for (const t of gradeTerms.slice(0, 12)) {
        const alts = t.altTerms?.length ? ` (أو: ${t.altTerms.join("، ")})` : "";
        const notation = t.notation ? ` [${t.notation}]` : "";
        context += `• ${t.term}${alts}${notation}: ${t.definition}\n`;
      }
    }
  }

  context += `\n⚠️ التزم بهذه المصطلحات المصرية في ردودك بدقة.\n`;

  return context;
}

export function getEgyptianExamples(subject: string, grade: string): string[] {
  const curriculum = loadCurriculum(subject, grade);
  if (!curriculum) return [];

  const examples: string[] = [];
  for (const unit of curriculum.units) {
    for (const lesson of unit.lessons) {
      if (lesson.egyptianExamples) {
        examples.push(...lesson.egyptianExamples);
      }
    }
  }
  return examples.slice(0, 5);
}
