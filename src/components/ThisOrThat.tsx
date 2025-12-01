import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Poll {
  id: string;
  question_a: string;
  question_b: string;
  emoji_a: string;
  emoji_b: string;
  category: string;
}

export default function ThisOrThat() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [pollResults, setPollResults] = useState<{ a: number; b: number } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    const init = async () => {
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Load polls
        const { data: pollsData, error: pollsError } = await supabase
          .from('polls')
          .select('*')
          .order('created_at', { ascending: false });

        if (pollsError) {
          console.error('Error loading polls:', pollsError);
          toast.error("Σφάλμα φόρτωσης polls");
        } else if (pollsData && pollsData.length > 0) {
          setPolls(pollsData);
          setCurrentIndex(Math.floor(Math.random() * pollsData.length));
          
          // Load user's existing votes
          const { data: votes } = await supabase
            .from('poll_votes')
            .select('poll_id, choice')
            .eq('user_id', user.id);
          
          if (votes) {
            const votesMap: Record<string, string> = {};
            votes.forEach(vote => {
              votesMap[vote.poll_id] = vote.choice;
            });
            setUserVotes(votesMap);
          }
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleVote = async (choice: 'A' | 'B') => {
    if (!userId) {
      toast.error("Πρέπει να συνδεθείς για να ψηφίσεις!");
      return;
    }

    if (polls.length === 0) return;
    
    const currentPoll = polls[currentIndex];
    
    try {
      // Save vote
      const { error } = await supabase
        .from('poll_votes')
        .upsert({
          user_id: userId,
          poll_id: currentPoll.id,
          choice: choice
        }, {
          onConflict: 'user_id,poll_id'
        });

      if (error) throw error;

      // Update local state
      setUserVotes(prev => ({ ...prev, [currentPoll.id]: choice }));
      setSelectedOption(choice);

      // Fetch results
      const { data: results, error: resultsError } = await supabase
        .from('poll_votes')
        .select('choice')
        .eq('poll_id', currentPoll.id);

      if (resultsError) throw resultsError;

      const aVotes = results?.filter(r => r.choice === 'A').length || 0;
      const bVotes = results?.filter(r => r.choice === 'B').length || 0;

      setPollResults({ a: aVotes, b: bVotes });
      setShowResults(true);

      toast.success("Ψήφος καταχωρήθηκε! ✨");
    } catch (error) {
      console.error('Error voting:', error);
      toast.error("Σφάλμα κατά την ψηφοφορία");
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        navigateNext();
      } else {
        navigatePrev();
      }
    }
  };

  const navigateNext = () => {
    if (isAnimating || polls.length === 0) return;
    setIsAnimating(true);
    setSlideDirection('left');
    setTimeout(() => {
      const newIndex = (currentIndex + 1) % polls.length;
      setCurrentIndex(newIndex);
      const newPoll = polls[newIndex];
      setSelectedOption(userVotes[newPoll.id] as 'A' | 'B' | null || null);
      setShowResults(false);
      setPollResults(null);
      setSlideDirection(null);
      setIsAnimating(false);
    }, 300);
  };

  const navigatePrev = () => {
    if (isAnimating || polls.length === 0) return;
    setIsAnimating(true);
    setSlideDirection('right');
    setTimeout(() => {
      const newIndex = (currentIndex - 1 + polls.length) % polls.length;
      setCurrentIndex(newIndex);
      const newPoll = polls[newIndex];
      setSelectedOption(userVotes[newPoll.id] as 'A' | 'B' | null || null);
      setShowResults(false);
      setPollResults(null);
      setSlideDirection(null);
      setIsAnimating(false);
    }, 300);
  };

  if (loading) {
    return (
      <Card className="bg-purple-50/80 border-none">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Φόρτωση...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (polls.length === 0) {
    return (
      <Card className="bg-purple-50/80 border-none">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "'Pacifico', cursive" }}>
              This or That? 🤔
            </h3>
            <p className="text-sm text-muted-foreground">Δεν υπάρχουν διαθέσιμα polls</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPoll = polls[currentIndex];

  return (
    <Card className="bg-purple-50/80 border-none hover:shadow-xl transition-all overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Pacifico', cursive" }}>
            This or That? 🤔
          </h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigatePrev}
              disabled={isAnimating}
              className="h-9 w-9 p-0 rounded-full hover:bg-purple-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateNext}
              disabled={isAnimating}
              className="h-9 w-9 p-0 rounded-full hover:bg-purple-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div 
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`transition-all duration-300 ease-out ${
              slideDirection === 'left' 
                ? '-translate-x-full opacity-0' 
                : slideDirection === 'right' 
                ? 'translate-x-full opacity-0' 
                : 'translate-x-0 opacity-100'
            }`}
          >
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleVote('A')}
                variant={selectedOption === 'A' ? 'default' : 'outline'}
                disabled={showResults}
                className={`h-32 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${
                  selectedOption === 'A' ? 'scale-105 shadow-lg' : 'hover:scale-105'
                }`}
              >
                <span className="text-3xl">{currentPoll.emoji_a || '💖'}</span>
                <span className="text-sm font-semibold text-center px-2">{currentPoll.question_a}</span>
                {showResults && pollResults && (pollResults.a + pollResults.b) > 0 && (
                  <span className="text-xs font-normal opacity-80">
                    {Math.round((pollResults.a / (pollResults.a + pollResults.b)) * 100)}%
                  </span>
                )}
              </Button>

              <Button
                onClick={() => handleVote('B')}
                variant={selectedOption === 'B' ? 'default' : 'outline'}
                disabled={showResults}
                className={`h-32 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${
                  selectedOption === 'B' ? 'scale-105 shadow-lg' : 'hover:scale-105'
                }`}
              >
                <span className="text-3xl">{currentPoll.emoji_b || '✨'}</span>
                <span className="text-sm font-semibold text-center px-2">{currentPoll.question_b}</span>
                {showResults && pollResults && (pollResults.a + pollResults.b) > 0 && (
                  <span className="text-xs font-normal opacity-80">
                    {Math.round((pollResults.b / (pollResults.a + pollResults.b)) * 100)}%
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            {currentIndex + 1} / {polls.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Swipe ή χρησιμοποίησε τα βελάκια
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
