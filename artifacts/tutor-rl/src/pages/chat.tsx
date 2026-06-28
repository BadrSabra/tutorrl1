import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useSendChat, useSubmitFeedback } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, Bot, User, ArrowLeft, ArrowRight, Loader2, ThumbsUp, ThumbsDown, GraduationCap, PlusCircle
} from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { 
  Subject, Grade, AppSettings, Session, Message, ArchivedSession,
  SUBJECT_NAMES_AR, GRADE_NAMES_AR, LEVEL_NAMES_AR 
} from "@/lib/types";

export default function Chat() {
  const [, setLocation] = useLocation();
  const [currentSubject] = useLocalStorage<Subject | null>("tutorrl_current_subject", null);
  const [currentGrade] = useLocalStorage<Grade | null>("tutorrl_current_grade", null);
  const [profile] = useLocalStorage<any>("tutorrl_student_profile", null);
  const [settings] = useLocalStorage<AppSettings>("tutorrl_settings", {
    language: "ar",
    learningStyle: "step-by-step",
    theme: "light",
    fontSize: "medium"
  });
  const [session, setSession] = useLocalStorage<Session | null>("tutorrl_current_session", null);
  const [sessionHistory, setSessionHistory] = useLocalStorage<ArchivedSession[]>("tutorrl_session_history", []);

  const isAr = settings.language === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const sendChatMutation = useSendChat();
  const submitFeedbackMutation = useSubmitFeedback();

  useEffect(() => {
    if (!currentSubject || !currentGrade) {
      setLocation("/subjects");
      return;
    }

    if (!session || session.subject !== currentSubject || session.grade !== currentGrade) {
      setSession({
        id: crypto.randomUUID(),
        subject: currentSubject,
        grade: currentGrade,
        level: profile?.level || "beginner",
        startTime: Date.now(),
        messages: [{
          id: crypto.randomUUID(),
          role: "assistant",
          content: isAr 
            ? `مرحباً بك! أنا معلم ${SUBJECT_NAMES_AR[currentSubject]} الخاص بك. كيف يمكنني مساعدتك اليوم؟` 
            : `Hello! I'm your ${currentSubject} tutor. How can I help you today?`,
          timestamp: Date.now()
        }]
      });
    }
  }, [currentSubject, currentGrade, profile, session, setSession, setLocation, isAr]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages, sendChatMutation.isPending]);

  const archiveCurrentSession = () => {
    if (session && session.messages.length > 1) {
      const archived: ArchivedSession = { ...session, endTime: Date.now() };
      setSessionHistory(prev => [archived, ...(prev || [])].slice(0, 20));
    }
  };

  const handleNewSession = () => {
    archiveCurrentSession();
    if (currentSubject && currentGrade) {
      const welcomeContent = isAr 
        ? `مرحباً بك! أنا معلم ${SUBJECT_NAMES_AR[currentSubject]} الخاص بك. كيف يمكنني مساعدتك اليوم؟`
        : `Hello! I'm your ${currentSubject} tutor. How can I help you today?`;
      setSession({
        id: crypto.randomUUID(),
        subject: currentSubject,
        grade: currentGrade,
        level: profile?.level || "beginner",
        startTime: Date.now(),
        messages: [{
          id: crypto.randomUUID(),
          role: "assistant",
          content: welcomeContent,
          timestamp: Date.now()
        }]
      });
    }
  };

  const handleSend = () => {
    if (!input.trim() || !session || !currentSubject || !currentGrade) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: Date.now()
    };

    const newMessages = [...session.messages, userMessage];
    
    setSession({
      ...session,
      messages: newMessages
    });
    
    setInput("");

    const apiMessages = newMessages.map(m => ({
      role: m.role,
      content: m.content
    }));

    sendChatMutation.mutate({
      data: {
        messages: apiMessages,
        subject: currentSubject as any,
        grade: currentGrade as any,
        level: profile?.level || "beginner",
        language: settings.language,
        learningStyle: settings.learningStyle,
        studentStrengths: profile?.strengths,
        studentWeaknesses: profile?.weaknesses
      }
    }, {
      onSuccess: (res) => {
        setSession(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [
              ...prev.messages,
              {
                id: res.messageId,
                role: "assistant",
                content: res.content,
                timestamp: Date.now()
              }
            ]
          };
        });
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFeedback = (messageId: string, rating: 'like' | 'dislike') => {
    submitFeedbackMutation.mutate({
      data: {
        messageId,
        rating
      }
    });

    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: prev.messages.map(m => 
          m.id === messageId ? { ...m, feedback: rating } : m
        )
      };
    });
  };

  if (!session || !currentSubject || !currentGrade) return null;

  const userMessageCount = session.messages.filter(m => m.role === "user").length;

  return (
    <div className="flex flex-col h-[100dvh] bg-background max-w-4xl mx-auto w-full shadow-xl md:border-x">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/subjects")}>
          <ArrowIcon className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="w-10 h-10 border bg-primary/10 flex-shrink-0">
            <AvatarFallback className="bg-transparent text-primary">
              <Bot className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="font-semibold leading-tight truncate">
              {isAr ? `معلم ${SUBJECT_NAMES_AR[currentSubject]}` : `${currentSubject} Tutor`}
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />
              {isAr ? GRADE_NAMES_AR[currentGrade] : currentGrade} • {isAr ? LEVEL_NAMES_AR[profile?.level as keyof typeof LEVEL_NAMES_AR || 'beginner'] : (profile?.level || 'beginner')}
              {userMessageCount > 0 && (
                <span className="ms-1 text-muted-foreground/60">• {userMessageCount} {isAr ? "رسائل" : "msgs"}</span>
              )}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-shrink-0 gap-1.5 text-xs"
          onClick={handleNewSession}
          title={isAr ? "جلسة جديدة" : "New Session"}
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">{isAr ? "جلسة جديدة" : "New Session"}</span>
        </Button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 dark:bg-slate-900/20" ref={scrollRef}>
        {session.messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div key={msg.id} className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <Avatar className={`w-8 h-8 flex-shrink-0 ${isUser ? 'bg-accent/20' : 'bg-primary/10'}`}>
                <AvatarFallback className="bg-transparent">
                  {isUser ? <User className="w-4 h-4 text-accent" /> : <Bot className="w-4 h-4 text-primary" />}
                </AvatarFallback>
              </Avatar>
              <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`p-3.5 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap ${
                  isUser 
                    ? "bg-primary text-primary-foreground rounded-tr-sm rtl:rounded-tl-sm rtl:rounded-tr-2xl" 
                    : "bg-card border shadow-sm rounded-tl-sm rtl:rounded-tr-sm rtl:rounded-tl-2xl"
                }`}>
                  {msg.content}
                </div>
                
                {!isUser && idx > 0 && (
                  <div className="flex gap-1 mt-1 opacity-60 hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-7 w-7 rounded-full ${msg.feedback === 'like' ? 'text-green-500 bg-green-500/10' : ''}`}
                      onClick={() => handleFeedback(msg.id, 'like')}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-7 w-7 rounded-full ${msg.feedback === 'dislike' ? 'text-red-500 bg-red-500/10' : ''}`}
                      onClick={() => handleFeedback(msg.id, 'dislike')}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {sendChatMutation.isPending && (
          <div className="flex gap-3 animate-in fade-in duration-300">
            <Avatar className="w-8 h-8 flex-shrink-0 bg-primary/10">
              <AvatarFallback className="bg-transparent">
                <Bot className="w-4 h-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="p-4 bg-card border shadow-sm rounded-2xl rounded-tl-sm rtl:rounded-tr-sm rtl:rounded-tl-2xl flex gap-1 items-center h-[52px]">
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-background border-t">
        <div className="flex gap-2 relative items-end">
          <Input
            className="flex-1 min-h-[56px] py-3 px-4 text-base rounded-2xl pr-12 rtl:pl-12 rtl:pr-4 bg-secondary/50 border-secondary-border focus-visible:ring-primary focus-visible:bg-background transition-all resize-none"
            placeholder={isAr ? "اسألني أي سؤال..." : "Ask me a question..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sendChatMutation.isPending}
          />
          <Button 
            className="absolute bottom-2 right-2 rtl:left-2 rtl:right-auto rounded-xl w-10 h-10" 
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || sendChatMutation.isPending}
          >
            {sendChatMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5 rtl:-scale-x-100" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
