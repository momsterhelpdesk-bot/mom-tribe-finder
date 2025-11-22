import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Trash2, Clock, Pin, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Question {
  id: string;
  content: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  user_id: string;
  category: string;
  pseudonym: string | null;
  display_mode: string;
  likes_count: number;
  answers_count: number;
}

interface Answer {
  id: string;
  content: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  user_id: string;
  question_id: string;
  pseudonym: string | null;
  likes_count: number;
}

export default function ForumModeration() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedItem, setSelectedItem] = useState<{ id: string; type: "question" | "answer" } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: questionsData } = await supabase
        .from("questions")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: answersData } = await supabase
        .from("answers")
        .select("*")
        .order("created_at", { ascending: false });

      setQuestions(questionsData || []);
      setAnswers(answersData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία φόρτωσης δεδομένων",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, type: "question" | "answer") => {
    try {
      const table = type === "question" ? "questions" : "answers";
      
      const { error } = await supabase
        .from(table)
        .update({ status: "approved", rejection_reason: null })
        .eq("id", id);

      if (error) throw error;

      // Log the action
      await supabase.from("moderation_logs").insert({
        action: "approve",
        target_type: type,
        target_id: id,
        details: { status: "approved" },
      });

      toast({
        title: "Επιτυχία",
        description: `${type === "question" ? "Η ερώτηση" : "Η απάντηση"} εγκρίθηκε`,
      });

      fetchData();
    } catch (error) {
      console.error("Error approving:", error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία έγκρισης",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedItem || !rejectionReason.trim()) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ προσθέστε λόγο απόρριψης",
        variant: "destructive",
      });
      return;
    }

    try {
      const table = selectedItem.type === "question" ? "questions" : "answers";
      
      const { error } = await supabase
        .from(table)
        .update({ status: "rejected", rejection_reason: rejectionReason })
        .eq("id", selectedItem.id);

      if (error) throw error;

      // Log the action
      await supabase.from("moderation_logs").insert({
        action: "reject",
        target_type: selectedItem.type,
        target_id: selectedItem.id,
        details: { reason: rejectionReason },
      });

      toast({
        title: "Επιτυχία",
        description: `${selectedItem.type === "question" ? "Η ερώτηση" : "Η απάντηση"} απορρίφθηκε`,
      });

      setSelectedItem(null);
      setRejectionReason("");
      fetchData();
    } catch (error) {
      console.error("Error rejecting:", error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία απόρριψης",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, type: "question" | "answer") => {
    try {
      const table = type === "question" ? "questions" : "answers";
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Log the action
      await supabase.from("moderation_logs").insert({
        action: "delete",
        target_type: type,
        target_id: id,
      });

      toast({
        title: "Επιτυχία",
        description: `${type === "question" ? "Η ερώτηση" : "Η απάντηση"} διαγράφηκε`,
      });

      fetchData();
    } catch (error) {
      console.error("Error deleting:", error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία διαγραφής",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
          <Clock className="w-3 h-3 mr-1" />
          Εκκρεμής
        </Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Εγκεκριμένο
        </Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
          <XCircle className="w-3 h-3 mr-1" />
          Απορριφθέν
        </Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Φόρτωση...</div>;
  }

  const pendingQuestions = questions.filter(q => q.status === "pending");
  const pendingAnswers = answers.filter(a => a.status === "pending");

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending-questions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending-questions">
            Εκκρεμείς Ερωτήσεις ({pendingQuestions.length})
          </TabsTrigger>
          <TabsTrigger value="pending-answers">
            Εκκρεμείς Απαντήσεις ({pendingAnswers.length})
          </TabsTrigger>
          <TabsTrigger value="all-questions">
            Όλες οι Ερωτήσεις ({questions.length})
          </TabsTrigger>
          <TabsTrigger value="all-answers">
            Όλες οι Απαντήσεις ({answers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending-questions" className="space-y-4">
          {pendingQuestions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Δεν υπάρχουν εκκρεμείς ερωτήσεις
              </CardContent>
            </Card>
          ) : (
            pendingQuestions.map((question) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(question.status)}
                        {question.category && (
                          <Badge variant="secondary">{question.category}</Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{question.content}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(question.created_at).toLocaleString("el-GR")}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleApprove(question.id, "question")}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Έγκριση
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setSelectedItem({ id: question.id, type: "question" })}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Απόρριψη
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(question.id, "question")}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Διαγραφή
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="pending-answers" className="space-y-4">
          {pendingAnswers.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Δεν υπάρχουν εκκρεμείς απαντήσεις
              </CardContent>
            </Card>
          ) : (
            pendingAnswers.map((answer) => (
              <Card key={answer.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      {getStatusBadge(answer.status)}
                      <CardTitle className="text-lg">{answer.content}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(answer.created_at).toLocaleString("el-GR")}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleApprove(answer.id, "answer")}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Έγκριση
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setSelectedItem({ id: answer.id, type: "answer" })}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Απόρριψη
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(answer.id, "answer")}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Διαγραφή
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="all-questions" className="space-y-4">
          {questions.map((question) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(question.status)}
                      {question.category && (
                        <Badge variant="secondary">{question.category}</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{question.content}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(question.created_at).toLocaleString("el-GR")} • 
                      {question.likes_count} likes • {question.answers_count} απαντήσεις
                    </p>
                    {question.rejection_reason && (
                      <p className="text-sm text-red-500">
                        Λόγος απόρριψης: {question.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(question.id, "question")}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Διαγραφή
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="all-answers" className="space-y-4">
          {answers.map((answer) => (
            <Card key={answer.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    {getStatusBadge(answer.status)}
                    <CardTitle className="text-lg">{answer.content}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(answer.created_at).toLocaleString("el-GR")} • 
                      {answer.likes_count} likes
                    </p>
                    {answer.rejection_reason && (
                      <p className="text-sm text-red-500">
                        Λόγος απόρριψης: {answer.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(answer.id, "answer")}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Διαγραφή
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Απόρριψη {selectedItem?.type === "question" ? "Ερώτησης" : "Απάντησης"}</AlertDialogTitle>
            <AlertDialogDescription>
              Παρακαλώ προσθέστε τον λόγο απόρριψης. Ο χρήστης θα ενημερωθεί αυτόματα.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Λόγος απόρριψης..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setSelectedItem(null);
              setRejectionReason("");
            }}>
              Ακύρωση
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleReject}>
              Απόρριψη
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}