import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format, formatDistanceToNow, differenceInHours, differenceInMinutes, differenceInDays } from "date-fns";
import { el } from "date-fns/locale";
import { 
  Plus, MapPin, Calendar, Clock, Users, Baby, Coffee, 
  TreePine, ShoppingBag, Heart, Lock, Info, AlertTriangle,
  MessageCircle, ArrowLeft, Timer, X, Bell, Trash2
} from "lucide-react";
import mascot from "@/assets/mascot.jpg";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
interface MomMeet {
  id: string;
  creator_id: string;
  area: string;
  city: string;
  meet_date: string;
  meet_time: string;
  meet_type: string;
  description: string | null;
  max_participants: number;
  status: string;
  created_at: string;
  participant_count?: number;
  creator_name?: string;
  is_participant?: boolean;
}

const MEET_TYPES = [
  { value: 'playdate', label: 'Playdate', emoji: '🧸', icon: Baby },
  { value: 'stroller_walk', label: 'Stroller walk', emoji: '🚶‍♀️', icon: TreePine },
  { value: 'coffee', label: 'Καφές με καρότσι', emoji: '☕', icon: Coffee },
  { value: 'playground', label: 'Παιδότοπος', emoji: '🛝', icon: ShoppingBag },
  { value: 'park_walk', label: 'Βόλτα στο πάρκο & κουβέντα', emoji: '🌳', icon: TreePine },
];

const CHAT_NAMES = {
  playdate: '🧸 Μαμαδοπαρέα',
  stroller_walk: '🚶‍♀️ Μαμαδοπαρέα σε βόλτα',
  coffee: '☕ Μαμαδοπαρέα για καφέ',
  playground: '🛝 Μαμαδοπαρέα στον παιδότοπο',
  park_walk: '🌳 Μαμαδοπαρέα στο πάρκο',
};

export default function MomMeets() {
  const navigate = useNavigate();
  const [meets, setMeets] = useState<MomMeet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userCity, setUserCity] = useState<string>("");
  const [userArea, setUserArea] = useState<string>("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joiningMeetId, setJoiningMeetId] = useState<string | null>(null);
  const [cancellingMeetId, setCancellingMeetId] = useState<string | null>(null);
  const [cancellingEntireMeetId, setCancellingEntireMeetId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    area: "",
    city: "",
    meet_date: "",
    meet_time: "",
    meet_type: "",
    description: "",
    max_participants: 5,
  });

  // Countdown timer helper
  const getCountdown = (meetDate: string, meetTime: string) => {
    const meetDateTime = new Date(`${meetDate}T${meetTime}`);
    const now = new Date();
    
    if (meetDateTime <= now) return null;
    
    const days = differenceInDays(meetDateTime, now);
    const hours = differenceInHours(meetDateTime, now) % 24;
    const minutes = differenceInMinutes(meetDateTime, now) % 60;
    
    if (days > 0) {
      return `σε ${days} μέρ${days === 1 ? 'α' : 'ες'}`;
    } else if (hours > 0) {
      return `σε ${hours} ώρ${hours === 1 ? 'α' : 'ες'}`;
    } else {
      return `σε ${minutes} λεπτά`;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setCurrentUserId(user.id);

      // Get user's profile for default location
      const { data: profile } = await supabase
        .from("profiles")
        .select("city, area")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        setUserCity(profile.city);
        setUserArea(profile.area);
        setFormData(prev => ({ ...prev, city: profile.city, area: profile.area }));
      }

      // Load mom meets
      const { data: meetsData, error } = await supabase
        .from("mom_meets")
        .select("*")
        .in("status", ["active", "full"])
        .gte("meet_date", new Date().toISOString().split('T')[0])
        .order("meet_date", { ascending: true });

      if (error) throw error;

      // Get participant counts and check user participation
      const meetsWithCounts = await Promise.all((meetsData || []).map(async (meet) => {
        const { count } = await supabase
          .from("mom_meet_participants")
          .select("*", { count: "exact", head: true })
          .eq("mom_meet_id", meet.id)
          .eq("status", "confirmed");

        const { data: participation } = await supabase
          .from("mom_meet_participants")
          .select("id")
          .eq("mom_meet_id", meet.id)
          .eq("user_id", user.id)
          .eq("status", "confirmed")
          .maybeSingle();

        // Get creator name
        const { data: creator } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", meet.creator_id)
          .single();

        return {
          ...meet,
          participant_count: (count || 0) + 1, // +1 for creator
          creator_name: creator?.full_name || "Μαμά",
          is_participant: !!participation || meet.creator_id === user.id,
        };
      }));

      setMeets(meetsWithCounts);
    } catch (error) {
      console.error("Error loading mom meets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeet = async () => {
    if (!currentUserId) return;
    
    if (!formData.area || !formData.city || !formData.meet_date || !formData.meet_time || !formData.meet_type) {
      toast.error("Συμπλήρωσε όλα τα υποχρεωτικά πεδία");
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("mom_meets")
        .insert({
          creator_id: currentUserId,
          area: formData.area,
          city: formData.city,
          meet_date: formData.meet_date,
          meet_time: formData.meet_time,
          meet_type: formData.meet_type,
          description: formData.description || null,
          max_participants: formData.max_participants,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Μια μαμά άναψε φως στο χωριό 💡");
      setShowCreateDialog(false);
      setFormData({
        area: userArea,
        city: userCity,
        meet_date: "",
        meet_time: "",
        meet_type: "",
        description: "",
        max_participants: 5,
      });
      loadData();
    } catch (error) {
      console.error("Error creating mom meet:", error);
      toast.error("Σφάλμα κατά τη δημιουργία");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinMeet = async (meetId: string) => {
    if (!currentUserId) return;

    setJoiningMeetId(meetId);
    try {
      const { error } = await supabase
        .from("mom_meet_participants")
        .insert({
          mom_meet_id: meetId,
          user_id: currentUserId,
        });

      if (error) throw error;

      toast.success("Μια ακόμα μαμά πλησιάζει 🤍");
      await loadData();
      // Navigate to chat after joining
      navigate(`/mom-meet-chat/${meetId}`);
    } catch (error: any) {
      console.error("Error joining meet:", error);
      if (error.code === "23505") {
        toast.error("Έχεις ήδη δηλώσει συμμετοχή");
        // If already participant, just navigate to chat
        navigate(`/mom-meet-chat/${meetId}`);
      } else {
        toast.error("Σφάλμα κατά τη συμμετοχή");
      }
    } finally {
      setJoiningMeetId(null);
    }
  };

  const handleCancelParticipation = async (meetId: string, isCreator: boolean) => {
    if (!currentUserId) return;
    
    if (isCreator) {
      toast.error("Δεν μπορείς να ακυρώσεις τη συμμετοχή σου ως διοργανώτρια");
      return;
    }

    setCancellingMeetId(meetId);
    try {
      const { error } = await supabase
        .from("mom_meet_participants")
        .delete()
        .eq("mom_meet_id", meetId)
        .eq("user_id", currentUserId);

      if (error) throw error;

      toast.success("Η συμμετοχή σου ακυρώθηκε");
      await loadData();
    } catch (error) {
      console.error("Error cancelling participation:", error);
      toast.error("Σφάλμα κατά την ακύρωση");
    } finally {
      setCancellingMeetId(null);
    }
  };

  const handleCancelEntireMeet = async (meetId: string, meetType: string, meetDate: string, meetTime: string) => {
    if (!currentUserId) return;

    setCancellingEntireMeetId(meetId);
    try {
      // Get all participants to notify them
      const { data: participants } = await supabase
        .from("mom_meet_participants")
        .select("user_id")
        .eq("mom_meet_id", meetId)
        .eq("status", "confirmed");

      // Update meet status to cancelled
      const { error: updateError } = await supabase
        .from("mom_meets")
        .update({ status: "cancelled" })
        .eq("id", meetId)
        .eq("creator_id", currentUserId);

      if (updateError) throw updateError;

      // Send notifications to all participants
      const typeInfo = getMeetTypeInfo(meetType);
      const formattedDate = format(new Date(meetDate), "d MMMM", { locale: el });
      
      if (participants && participants.length > 0) {
        const notifications = participants.map(p => ({
          user_id: p.user_id,
          type: "mom_meet_cancelled",
          title: "Ακυρώθηκε Mom Meet",
          message: `Το ${typeInfo.emoji} ${typeInfo.label} στις ${formattedDate} ακυρώθηκε από τη διοργανώτρια.`,
          icon: "calendar-x",
          metadata: { meet_id: meetId },
        }));

        await supabase
          .from("notifications")
          .insert(notifications);
      }

      toast.success("Το Mom Meet ακυρώθηκε και ειδοποιήθηκαν οι συμμετέχουσες");
      await loadData();
    } catch (error) {
      console.error("Error cancelling meet:", error);
      toast.error("Σφάλμα κατά την ακύρωση");
    } finally {
      setCancellingEntireMeetId(null);
    }
  };

  const getMeetTypeInfo = (type: string) => {
    return MEET_TYPES.find(t => t.value === type) || MEET_TYPES[0];
  };

  const myAreaMeets = meets.filter(m => m.area === userArea || m.city === userCity);
  const otherMeets = meets.filter(m => m.area !== userArea && m.city !== userCity);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 relative pb-32">
      <img 
        src={mascot} 
        alt="Momster Mascot" 
        className="fixed top-24 right-4 w-16 h-16 opacity-15 object-contain pointer-events-none"
      />
      
      <div className="max-w-2xl mx-auto pt-6 px-4">
        {/* Back Button */}
        <Link 
          to="/daily-boost" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Πίσω στο Momster Home</span>
        </Link>
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Pacifico', cursive" }}>
            🏡 Mom Meets
          </h1>
          <p className="text-muted-foreground text-sm">The village in action 🤍</p>
        </div>

        {/* Manifesto Card */}
        <Card className="mb-6 bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200/50">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-center text-muted-foreground italic">
              Το Momster δεν είναι feed. Είναι χωριό.<br />
              Και εδώ το χωριό συναντιέται.
            </p>
          </CardContent>
        </Card>

        {/* Section 1: Mom-led Mom Meets */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">1️⃣</span>
            <h2 className="text-lg font-semibold">Mom-led Mom Meets</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Άτυπες, μικρές, χαμηλής πίεσης συναντήσεις.<br />
            Οργανώνονται από τις ίδιες τις μαμάδες.
          </p>

          {/* Create CTA */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow border-dashed border-2 border-rose-200 bg-rose-50/50">
                <CardContent className="py-6 text-center">
                  <Plus className="w-8 h-8 mx-auto mb-2 text-rose-400" />
                  <p className="font-medium text-rose-600">➕ Δημιούργησε Mom Meet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ψάχνεις playdate; Πηγαίνεις κάπου με τα παιδιά σου;<br />
                    Δες ποια μαμά μπορεί να έρθει 🤍
                  </p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span>📝</span> Νέο Mom Meet
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Πόλη *
                    </Label>
                    <Input 
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="π.χ. Αθήνα"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Περιοχή *
                    </Label>
                    <Input 
                      value={formData.area}
                      onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                      placeholder="π.χ. Κολωνάκι"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Ημερομηνία *
                    </Label>
                    <Input 
                      type="date"
                      value={formData.meet_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, meet_date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Ώρα *
                    </Label>
                    <Input 
                      type="time"
                      value={formData.meet_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, meet_time: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-1">
                    <Baby className="w-3 h-3" /> Τύπος συνάντησης *
                  </Label>
                  <Select 
                    value={formData.meet_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, meet_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Επίλεξε τύπο" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEET_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.emoji} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Σύντομη περιγραφή (έως 120 χαρακτήρες)</Label>
                  <Textarea 
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      description: e.target.value.slice(0, 120) 
                    }))}
                    placeholder="π.χ. Βόλτα στο πάρκο με τα μωρά μας!"
                    maxLength={120}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.description.length}/120
                  </p>
                </div>

                <div>
                  <Label className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> Μέγιστος αριθμός μαμάδων (3-6)
                  </Label>
                  <Select 
                    value={String(formData.max_participants)}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, max_participants: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={String(num)}>{num} μαμάδες</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleCreateMeet} 
                  disabled={creating}
                  className="w-full bg-gradient-to-r from-rose-400 to-pink-400"
                >
                  {creating ? "Δημιουργία..." : "✨ Δημιούργησε Mom Meet"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Active Meets */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Φόρτωση...
            </div>
          ) : myAreaMeets.length === 0 ? (
            <Card className="bg-white/50">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  Σήμερα το χωριό είναι ήσυχο εδώ.<br />
                  <span className="text-rose-500 font-medium">
                    👉 Γίνε η πρώτη μαμά που οργανώνει κάτι εδώ 💗
                  </span>
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myAreaMeets.map((meet) => {
                const typeInfo = getMeetTypeInfo(meet.meet_type);
                const isFull = (meet.participant_count || 0) >= meet.max_participants;
                const countdown = getCountdown(meet.meet_date, meet.meet_time);
                const isJoining = joiningMeetId === meet.id;
                
                return (
                  <Card key={meet.id} className={`overflow-hidden ${meet.is_participant ? 'ring-2 ring-rose-300' : ''}`}>
                    <CardHeader className="pb-2 pt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{typeInfo.emoji}</span>
                          <span className="font-medium">{typeInfo.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {countdown && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              <Timer className="w-3 h-3 mr-1" />
                              {countdown}
                            </Badge>
                          )}
                          {meet.is_participant && (
                            <Badge variant="secondary" className="bg-rose-100 text-rose-600">
                              Συμμετέχεις
                            </Badge>
                          )}
                          {isFull && !meet.is_participant && (
                            <Badge variant="secondary" className="bg-gray-100">
                              Πλήρες
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{meet.area}, {meet.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(meet.meet_date), "EEEE, d MMMM", { locale: el })}
                          </span>
                          <Clock className="w-4 h-4 ml-2" />
                          <span>{meet.meet_time.slice(0, 5)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{meet.participant_count}/{meet.max_participants} μαμάδες</span>
                        </div>
                        {meet.description && (
                          <p className="text-foreground italic mt-2">"{meet.description}"</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Οργανώνει: {meet.creator_name}
                        </p>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        {meet.is_participant ? (
                          <>
                            {/* Reminder badge */}
                            {countdown && (
                              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full">
                                <Bell className="w-3 h-3" />
                                <span>Υπενθύμιση: {countdown}</span>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="flex-1 bg-gradient-to-r from-rose-400 to-pink-400"
                                onClick={() => navigate(`/mom-meet-chat/${meet.id}`)}
                              >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                Μπες στο chat
                              </Button>
                              {meet.creator_id !== currentUserId ? (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-muted-foreground border-muted"
                                  onClick={() => handleCancelParticipation(meet.id, false)}
                                  disabled={cancellingMeetId === meet.id}
                                >
                                  {cancellingMeetId === meet.id ? "..." : <X className="w-4 h-4" />}
                                </Button>
                              ) : (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Ακύρωση Mom Meet</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Είσαι σίγουρη ότι θέλεις να ακυρώσεις αυτό το Mom Meet; 
                                        Όλες οι μαμάδες που έχουν δηλώσει συμμετοχή θα ειδοποιηθούν.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Όχι, κράτα το</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={() => handleCancelEntireMeet(meet.id, meet.meet_type, meet.meet_date, meet.meet_time)}
                                        disabled={cancellingEntireMeetId === meet.id}
                                      >
                                        {cancellingEntireMeetId === meet.id ? "Ακύρωση..." : "Ναι, ακύρωσε"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </>
                        ) : isFull ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, meet_type: meet.meet_type }));
                              setShowCreateDialog(true);
                            }}
                          >
                            Δημιούργησε άλλη μία ίδια συνάντηση
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            className="w-full bg-gradient-to-r from-rose-400 to-pink-400"
                            onClick={() => handleJoinMeet(meet.id)}
                            disabled={isJoining}
                          >
                            {isJoining ? (
                              <>Συμμετοχή...</>
                            ) : (
                              <>
                                <Heart className="w-4 h-4 mr-1" />
                                Θέλω να έρθω
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Other areas */}
          {otherMeets.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Σε άλλες περιοχές</h3>
              <div className="space-y-2">
                {otherMeets.slice(0, 3).map((meet) => {
                  const typeInfo = getMeetTypeInfo(meet.meet_type);
                  return (
                    <Card key={meet.id} className="opacity-75">
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{typeInfo.emoji}</span>
                            <span className="text-sm">{meet.area}, {meet.city}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(meet.meet_date), "d/M")}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Momster-hosted Mom Meets (Coming Soon) */}
        <Card className="mb-8 bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-50 border-purple-200 shadow-lg overflow-hidden">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">2️⃣</span>
              <span className="text-2xl">✨</span>
              <h2 className="text-xl font-bold text-purple-800">Momster Official Mom Meets</h2>
            </div>
            
            <div className="text-center mb-4">
              <Badge className="bg-purple-600 text-white text-sm px-4 py-1 animate-pulse">
                🚀 Coming Soon
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 justify-center opacity-80">
              {[
                { emoji: '🧸', label: 'Stroller walk' },
                { emoji: '🍷', label: 'Wine & chat' },
                { emoji: '📚', label: 'Ιστορίες & αγκαλιές' },
                { emoji: '🛝', label: 'Momster Playday' },
                { emoji: '🎨', label: 'Creative workshop' },
              ].map((item, idx) => (
                <div key={idx} className="inline-flex items-center gap-1.5 bg-white/60 rounded-full px-3 py-1.5">
                  <span className="text-sm">{item.emoji}</span>
                  <span className="text-xs text-purple-700 font-medium">{item.label}</span>
                  <Lock className="w-3 h-3 text-purple-300" />
                </div>
              ))}
            </div>
            
            <p className="text-center text-sm text-purple-600 mt-4 italic font-medium">
              Σύντομα το χωριό θα οργανώνει και μόνο του 🤍
            </p>
          </CardContent>
        </Card>

        {/* Village Value */}
        <Card className="mb-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50">
          <CardContent className="py-4 text-center">
            <p className="text-sm italic text-amber-800">
              "Το χωριό συναντιέται, σιγά και αληθινά."
            </p>
          </CardContent>
        </Card>

        {/* Safety Reminder */}
        <Card className="mb-6 bg-blue-50/50 border-blue-200/30">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 space-y-1">
                <p className="font-medium">🛡 Υπενθύμιση ασφάλειας</p>
                <p>Όλες οι συναντήσεις προτείνεται να γίνονται σε δημόσιους χώρους.</p>
                <p>Να εμπιστεύεσαι το ένστικτό σου και να φροντίζεις πάντα την ασφάλεια τη δική σου και των παιδιών σου.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="text-center text-xs text-muted-foreground mb-8 px-4">
          <p>
            Η Momster λειτουργεί ως χώρος σύνδεσης. Οι συναντήσεις οργανώνονται από τις ίδιες τις μαμάδες 
            και η συμμετοχή γίνεται με προσωπική ευθύνη. Συνιστούμε πάντα δημόσιους χώρους και προσοχή.
          </p>
        </div>

        {/* Mini Manifesto */}
        <Card className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 border-rose-200/50">
          <CardContent className="py-6 text-center space-y-2">
            <Heart className="w-6 h-6 mx-auto text-rose-400 mb-2" />
            <p className="text-sm text-muted-foreground">
              Το Momster δεν φτιάχτηκε για τέλειες στιγμές.<br />
              Φτιάχτηκε για αληθινές.<br />
              Για μαμάδες που θέλουν παρέα χωρίς πίεση.<br />
              Για μικρές συναντήσεις που ξεκινούν αυθόρμητα.<br />
              Για ένα χωριό που χτίζεται σιγά — από μαμά σε μαμά.
            </p>
            <p className="font-medium text-rose-600 mt-3">
              Αυτό είναι το Mom Meets.<br />
              The village in action 🤍
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 px-4 bg-background/95 backdrop-blur-md border-t border-border z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-3">
          <img src={mascot} alt="Momster Mascot" className="w-8 h-8 object-contain flex-shrink-0" />
          <span className="text-sm text-muted-foreground text-center leading-snug">
            Μικρές συναντήσεις.<br className="sm:hidden" /> Χωρίς πίεση. Με κατανόηση.
          </span>
        </div>
      </footer>
    </div>
  );
}
