import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import mascot from "@/assets/mascot.jpg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Question {
  id: string;
  content: string;
  display_mode: 'name' | 'pseudonym' | 'anonymous';
  likes_count: number;
  answers_count: number;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
  };
}

interface Answer {
  id: string;
  content: string;
  likes_count: number;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
  };
}

export default function AskMoms() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [displayMode, setDisplayMode] = useState<'name' | 'pseudonym' | 'anonymous'>('name');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [likedQuestions, setLikedQuestions] = useState<Set<string>>(new Set());
  const [likedAnswers, setLikedAnswers] = useState<Set<string>>(new Set());
  const [animatingHeart, setAnimatingHeart] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
    fetchUserLikes();
  }, []);

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching questions:', error);
      return;
    }

    if (data) {
      // Fetch profiles for each question
      const userIds = [...new Set(data.map(q => q.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const questionsWithProfiles = data.map(q => ({
        ...q,
        profiles: profiles?.find(p => p.id === q.user_id)
      }));

      setQuestions(questionsWithProfiles as any);
    }
  };

  const fetchUserLikes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: questionLikes } = await supabase
      .from('question_likes')
      .select('question_id')
      .eq('user_id', user.id);

    const { data: answerLikes } = await supabase
      .from('answer_likes')
      .select('answer_id')
      .eq('user_id', user.id);

    if (questionLikes) {
      setLikedQuestions(new Set(questionLikes.map(l => l.question_id)));
    }
    if (answerLikes) {
      setLikedAnswers(new Set(answerLikes.map(l => l.answer_id)));
    }
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Πρέπει να είσαι συνδεδεμένη", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from('questions')
      .insert({
        content: newQuestion,
        display_mode: displayMode,
        user_id: user.id
      });

    if (error) {
      toast({ title: "Σφάλμα", description: "Δεν μπόρεσε να δημοσιευτεί η ερώτηση", variant: "destructive" });
      return;
    }

    toast({ title: "Επιτυχία! 🌸", description: "Η ερώτησή σου δημοσιεύτηκε!" });
    setNewQuestion("");
    fetchQuestions();
  };

  const handleLikeQuestion = async (questionId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isLiked = likedQuestions.has(questionId);

    if (isLiked) {
      await supabase
        .from('question_likes')
        .delete()
        .eq('question_id', questionId)
        .eq('user_id', user.id);
      
      setLikedQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    } else {
      await supabase
        .from('question_likes')
        .insert({ question_id: questionId, user_id: user.id });
      
      setLikedQuestions(prev => new Set([...prev, questionId]));
      setAnimatingHeart(questionId);
      setTimeout(() => setAnimatingHeart(null), 1000);
    }

    fetchQuestions();
  };

  const fetchAnswers = async (questionId: string) => {
    const { data, error } = await supabase
      .from('answers')
      .select('*')
      .eq('question_id', questionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching answers:', error);
      return;
    }

    if (data) {
      // Fetch profiles for each answer
      const userIds = [...new Set(data.map(a => a.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const answersWithProfiles = data.map(a => ({
        ...a,
        profiles: profiles?.find(p => p.id === a.user_id)
      }));

      setAnswers(answersWithProfiles as any);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!newAnswer.trim() || !selectedQuestion) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Πρέπει να είσαι συνδεδεμένη", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from('answers')
      .insert({
        content: newAnswer,
        question_id: selectedQuestion.id,
        user_id: user.id
      });

    if (error) {
      toast({ title: "Σφάλμα", description: "Δεν μπόρεσε να δημοσιευτεί η απάντηση", variant: "destructive" });
      return;
    }

    toast({ title: "Επιτυχία! 💕", description: "Η απάντησή σου δημοσιεύτηκε!" });
    setNewAnswer("");
    fetchAnswers(selectedQuestion.id);
    fetchQuestions();
  };

  const handleLikeAnswer = async (answerId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isLiked = likedAnswers.has(answerId);

    if (isLiked) {
      await supabase
        .from('answer_likes')
        .delete()
        .eq('answer_id', answerId)
        .eq('user_id', user.id);
      
      setLikedAnswers(prev => {
        const newSet = new Set(prev);
        newSet.delete(answerId);
        return newSet;
      });
    } else {
      await supabase
        .from('answer_likes')
        .insert({ answer_id: answerId, user_id: user.id });
      
      setLikedAnswers(prev => new Set([...prev, answerId]));
      setAnimatingHeart(`answer-${answerId}`);
      setTimeout(() => setAnimatingHeart(null), 1000);
    }

    fetchAnswers(selectedQuestion!.id);
  };

  const getDisplayName = (question: Question) => {
    if (question.display_mode === 'anonymous') return 'Ανώνυμη 🌸';
    if (question.display_mode === 'pseudonym') return 'Μαμά ' + question.user_id.slice(0, 4);
    return question.profiles?.full_name || 'Μαμά';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 relative">
      <img 
        src={mascot} 
        alt="Momster Mascot" 
        className="fixed top-24 right-4 w-20 h-20 opacity-20 object-contain pointer-events-none animate-bounce"
      />
      
      {animatingHeart && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
          <Heart 
            className="w-16 h-16 text-primary fill-primary animate-[ping_1s_ease-out]" 
          />
        </div>
      )}

      <div className="max-w-2xl mx-auto pt-20 pb-24 px-4">
        {/* Header with Mom-Code */}
        <div className="mb-6 space-y-4">
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Pacifico', cursive" }}>
            Ρώτα μια μαμά 💬
          </h1>
          
          <Card className="p-4 bg-primary/5 border-primary/20">
            <h3 className="font-bold text-sm mb-2">🌸 Mom-Code: Ρωτάμε & απαντάμε με καλοσύνη, σεβασμό & χωρίς κριτική.</h3>
            <p className="text-xs text-muted-foreground mb-2">No judgment • No bullying • No hate • Μόνο αγάπη 💕</p>
            <details className="text-xs space-y-1 text-muted-foreground">
              <summary className="cursor-pointer font-semibold">Κανόνες</summary>
              <div className="mt-2 space-y-1 pl-2">
                <p>1️⃣ Είμαστε όλες εδώ για να βοηθήσουμε, όχι να κριτικάρουμε.</p>
                <p>2️⃣ Μοιραζόμαστε εμπειρίες, όχι ιατρικές διαγνώσεις.</p>
                <p>3️⃣ Σεβόμαστε κάθε μαμά & κάθε επιλογή.</p>
                <p>4️⃣ Δεν χρησιμοποιούμε επικριτικό ή προσβλητικό τόνο.</p>
                <p>5️⃣ Αν κάτι δεν σου ταιριάζει, απλά προσπέρνα — χωρίς σχόλιο αρνητικό.</p>
                <p>6️⃣ Οι συζητήσεις μένουν ασφαλείς, ζεστές & υποστηρικτικές. 🤍</p>
              </div>
            </details>
          </Card>
        </div>

        {/* Ask Question Form */}
        <Card className="p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-3">
            Ρώτα ελεύθερα άλλες μανούλες, χωρίς φόβο & χωρίς κρίση.
          </p>
          <Textarea
            placeholder="Ρώτησε ό,τι θέλεις εδώ..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="mb-3 min-h-[100px]"
          />
          
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium mb-2">Post as:</p>
              <Tabs value={displayMode} onValueChange={(v) => setDisplayMode(v as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="name">Δείξε το όνομα μου</TabsTrigger>
                  <TabsTrigger value="pseudonym">Με ψευδώνυμο</TabsTrigger>
                  <TabsTrigger value="anonymous">Ανώνυμα 🌸</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <Button onClick={handleSubmitQuestion} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Δημοσίευση
            </Button>
          </div>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          {questions.map((question) => (
            <Card key={question.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm">{getDisplayName(question)}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(question.created_at).toLocaleDateString('el-GR')}
                    </span>
                  </div>
                  <p className="text-foreground">{question.content}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikeQuestion(question.id)}
                  className="gap-2"
                >
                  <Heart 
                    className={`w-4 h-4 transition-all ${
                      likedQuestions.has(question.id) ? 'fill-primary text-primary scale-110' : ''
                    }`}
                  />
                  <span>{question.likes_count}</span>
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedQuestion(question);
                        fetchAnswers(question.id);
                      }}
                      className="gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{question.answers_count}</span>
                      <span className="text-xs">Απάντησε με αγάπη 💕</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Απαντήσεις</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <Card className="p-3 bg-secondary/30">
                        <p className="font-semibold text-sm mb-1">{getDisplayName(question)}</p>
                        <p className="text-sm">{question.content}</p>
                      </Card>

                      {/* Answers */}
                      <div className="space-y-3">
                        {answers.map((answer) => (
                          <Card key={answer.id} className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-semibold text-xs mb-1">
                                  {answer.profiles?.full_name || 'Μαμά'}
                                </p>
                                <p className="text-sm">{answer.content}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikeAnswer(answer.id)}
                              className="gap-2 h-7"
                            >
                              <Heart 
                                className={`w-3 h-3 transition-all ${
                                  likedAnswers.has(answer.id) ? 'fill-primary text-primary scale-110' : ''
                                }`}
                              />
                              <span className="text-xs">{answer.likes_count}</span>
                            </Button>
                          </Card>
                        ))}
                      </div>

                      {/* Answer Form */}
                      <div className="space-y-2 pt-3 border-t">
                        <Textarea
                          placeholder="Γράψε την απάντησή σου με αγάπη..."
                          value={newAnswer}
                          onChange={(e) => setNewAnswer(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <Button onClick={handleSubmitAnswer} className="w-full">
                          <Heart className="w-4 h-4 mr-2" />
                          Απάντησε με αγάπη 💕
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
