import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Heart, Sparkles } from "lucide-react";

export default function ContentManagement() {
  const [polls, setPolls] = useState<any[]>([]);
  const [isEditingPoll, setIsEditingPoll] = useState(false);
  const [editingPoll, setEditingPoll] = useState<any>({
    question_a: "",
    question_b: "",
    emoji_a: "💕",
    emoji_b: "🌸",
    category: "general",
  });

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    const { data, error } = await supabase
      .from("polls")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Σφάλμα φόρτωσης");
      return;
    }

    setPolls(data || []);
  };

  const handleSavePoll = async () => {
    if (!editingPoll.question_a || !editingPoll.question_b) {
      toast.error("Συμπληρώστε και τις δύο ερωτήσεις");
      return;
    }

    const { error } = await supabase
      .from("polls")
      .insert([editingPoll]);

    if (error) {
      toast.error("Σφάλμα αποθήκευσης");
      return;
    }

    toast.success("Το δίλημμα δημιουργήθηκε!");
    setIsEditingPoll(false);
    setEditingPoll({
      question_a: "",
      question_b: "",
      emoji_a: "💕",
      emoji_b: "🌸",
      category: "general",
    });
    loadPolls();
  };

  const handleDeletePoll = async (id: string) => {
    const { error } = await supabase
      .from("polls")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Σφάλμα διαγραφής");
      return;
    }

    toast.success("Το δίλημμα διαγράφηκε");
    loadPolls();
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="polls" className="w-full">
        <TabsList>
          <TabsTrigger value="polls">This or That</TabsTrigger>
          <TabsTrigger value="interests">Interests</TabsTrigger>
          <TabsTrigger value="popups">Pop-ups</TabsTrigger>
        </TabsList>

        <TabsContent value="polls" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  This or That Διλήμματα
                </CardTitle>
                <Button onClick={() => setIsEditingPoll(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Νέο Δίλημμα
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {polls.map((poll) => (
                  <div key={poll.id} className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{poll.emoji_a}</span>
                      <span className="font-medium">{poll.question_a}</span>
                      <span className="text-muted-foreground">vs</span>
                      <span className="text-2xl">{poll.emoji_b}</span>
                      <span className="font-medium">{poll.question_b}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeletePoll(poll.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {isEditingPoll && (
            <Card>
              <CardHeader>
                <CardTitle>Νέο This or That</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Επιλογή A</Label>
                    <Input
                      value={editingPoll.question_a}
                      onChange={(e) => setEditingPoll({ ...editingPoll, question_a: e.target.value })}
                      placeholder="π.χ. Βρεφική μέριμνα"
                    />
                  </div>
                  <div>
                    <Label>Emoji A</Label>
                    <Input
                      value={editingPoll.emoji_a}
                      onChange={(e) => setEditingPoll({ ...editingPoll, emoji_a: e.target.value })}
                      placeholder="💕"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Επιλογή B</Label>
                    <Input
                      value={editingPoll.question_b}
                      onChange={(e) => setEditingPoll({ ...editingPoll, question_b: e.target.value })}
                      placeholder="π.χ. Υποβοηθούμενη αναπαραγωγή"
                    />
                  </div>
                  <div>
                    <Label>Emoji B</Label>
                    <Input
                      value={editingPoll.emoji_b}
                      onChange={(e) => setEditingPoll({ ...editingPoll, emoji_b: e.target.value })}
                      placeholder="🌸"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSavePoll}>Αποθήκευση</Button>
                  <Button variant="outline" onClick={() => setIsEditingPoll(false)}>Ακύρωση</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="interests">
          <Card>
            <CardHeader>
              <CardTitle>Interests Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Interests management - Coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popups">
          <Card>
            <CardHeader>
              <CardTitle>Pop-ups & Empty States</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Pop-ups editor - Coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
