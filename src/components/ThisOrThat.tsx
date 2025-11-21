import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface Poll {
  id: string;
  question_a: string;
  question_b: string;
  emoji_a: string;
  emoji_b: string;
  category: string;
}

interface PollVote {
  poll_id: string;
  choice: 'a' | 'b';
}

export default function ThisOrThat() {
  const { language } = useLanguage();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [currentPollIndex, setCurrentPollIndex] = useState(0);
  const [userVotes, setUserVotes] = useState<Map<string, 'a' | 'b'>>(new Map());
  const [pollStats, setPollStats] = useState<Map<string, { a: number; b: number }>>(new Map());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolls();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
  };

  const fetchPolls = async () => {
    try {
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });

      if (pollsError) throw pollsError;
      setPolls(pollsData || []);

      // Fetch user's votes
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: votesData, error: votesError } = await supabase
          .from('poll_votes')
          .select('poll_id, choice')
          .eq('user_id', user.id);

        if (!votesError && votesData) {
          const votesMap = new Map(votesData.map(v => [v.poll_id, v.choice as 'a' | 'b']));
          setUserVotes(votesMap);
        }
      }

      // Fetch all votes for statistics
      const { data: allVotes, error: statsError } = await supabase
        .from('poll_votes')
        .select('poll_id, choice');

      if (!statsError && allVotes) {
        const stats = new Map<string, { a: number; b: number }>();
        allVotes.forEach(vote => {
          const current = stats.get(vote.poll_id) || { a: 0, b: 0 };
          if (vote.choice === 'a') current.a++;
          else current.b++;
          stats.set(vote.poll_id, current);
        });
        setPollStats(stats);
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string, choice: 'a' | 'b') => {
    if (!userId) {
      toast.error(language === "el" ? "Συνδεθείτε για να ψηφίσετε" : "Sign in to vote");
      return;
    }

    try {
      const existingVote = userVotes.get(pollId);
      
      if (existingVote === choice) {
        // Remove vote
        const { error } = await supabase
          .from('poll_votes')
          .delete()
          .eq('poll_id', pollId)
          .eq('user_id', userId);

        if (error) throw error;
        
        const newVotes = new Map(userVotes);
        newVotes.delete(pollId);
        setUserVotes(newVotes);
      } else if (existingVote) {
        // Update vote
        const { error } = await supabase
          .from('poll_votes')
          .update({ choice })
          .eq('poll_id', pollId)
          .eq('user_id', userId);

        if (error) throw error;
        
        const newVotes = new Map(userVotes);
        newVotes.set(pollId, choice);
        setUserVotes(newVotes);
      } else {
        // New vote
        const { error } = await supabase
          .from('poll_votes')
          .insert({ poll_id: pollId, user_id: userId, choice });

        if (error) throw error;
        
        const newVotes = new Map(userVotes);
        newVotes.set(pollId, choice);
        setUserVotes(newVotes);
      }

      // Refresh stats
      await fetchPolls();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error(language === "el" ? "Σφάλμα ψηφοφορίας" : "Error voting");
    }
  };

  const nextPoll = () => {
    setCurrentPollIndex((prev) => (prev + 1) % polls.length);
  };

  const prevPoll = () => {
    setCurrentPollIndex((prev) => (prev - 1 + polls.length) % polls.length);
  };

  if (loading || polls.length === 0) {
    return (
      <Card className="bg-purple-50/80 border-none">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">{language === "el" ? "Φόρτωση..." : "Loading..."}</p>
        </CardContent>
      </Card>
    );
  }

  const currentPoll = polls[currentPollIndex];
  const stats = pollStats.get(currentPoll.id) || { a: 0, b: 0 };
  const total = stats.a + stats.b;
  const percentA = total > 0 ? Math.round((stats.a / total) * 100) : 0;
  const percentB = total > 0 ? Math.round((stats.b / total) * 100) : 0;
  const userChoice = userVotes.get(currentPoll.id);

  return (
    <Card className="bg-purple-50/80 border-none hover:shadow-xl transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Pacifico', cursive" }}>
            This or That? 🤔
          </h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevPoll}
              className="h-8 w-8 p-0 rounded-full"
            >
              ←
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextPoll}
              className="h-8 w-8 p-0 rounded-full"
            >
              →
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Button
            onClick={() => handleVote(currentPoll.id, 'a')}
            variant={userChoice === 'a' ? 'default' : 'outline'}
            className="h-24 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <span className="text-3xl">{currentPoll.emoji_a}</span>
            <span className="text-sm font-semibold">{currentPoll.question_a}</span>
          </Button>

          <Button
            onClick={() => handleVote(currentPoll.id, 'b')}
            variant={userChoice === 'b' ? 'default' : 'outline'}
            className="h-24 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <span className="text-3xl">{currentPoll.emoji_b}</span>
            <span className="text-sm font-semibold">{currentPoll.question_b}</span>
          </Button>
        </div>

        {userChoice && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{currentPoll.emoji_a} {percentA}%</span>
              <span>{currentPoll.emoji_b} {percentB}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden flex">
              <div
                className="bg-primary transition-all duration-500"
                style={{ width: `${percentA}%` }}
              />
              <div
                className="bg-pink-400 transition-all duration-500"
                style={{ width: `${percentB}%` }}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              {total} {language === "el" ? "ψήφοι" : "votes"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
