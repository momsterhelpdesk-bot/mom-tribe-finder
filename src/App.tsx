import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useActivityTracker } from "./hooks/use-activity-tracker";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import ProfileSetup from "./pages/ProfileSetup";
import PhotoVerification from "./pages/PhotoVerification";
import Admin from "./pages/Admin";
import Discover from "./pages/Discover";
import MatchingFilters from "./pages/MatchingFilters";
import Chats from "./pages/Chats";
import ChatView from "./pages/ChatView";
import AskMoms from "./pages/AskMoms";
import DailyBoost from "./pages/DailyBoost";
import Marketplace from "./pages/Marketplace";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import PrivacyTerms from "./pages/PrivacyTerms";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import AuthGuard from "./components/AuthGuard";
import MomAlerts from "./components/MomAlerts";

const queryClient = new QueryClient();

function ActivityTracker() {
  useActivityTracker();
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ActivityTracker />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth-callback" element={<AuthCallback />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile-setup" element={<AuthGuard><ProfileSetup /></AuthGuard>} />
          <Route path="/photo-verification" element={<AuthGuard><PhotoVerification /></AuthGuard>} />
          <Route path="/admin" element={<AuthGuard><Admin /></AuthGuard>} />
          <Route path="/discover" element={<AuthGuard><><Discover /><MomAlerts /><BottomNav /></></AuthGuard>} />
          <Route path="/matching-filters" element={<AuthGuard><MatchingFilters /></AuthGuard>} />
          <Route path="/chats" element={<AuthGuard><><Chats /><MomAlerts /><BottomNav /></></AuthGuard>} />
          <Route path="/chat/:matchId" element={<AuthGuard><ChatView /></AuthGuard>} />
          <Route path="/ask-moms" element={<AuthGuard><><AskMoms /><MomAlerts /><BottomNav /></></AuthGuard>} />
          <Route path="/daily-boost" element={<AuthGuard><><DailyBoost /><MomAlerts /><BottomNav /></></AuthGuard>} />
          <Route path="/notifications" element={<AuthGuard><><Notifications /><MomAlerts /><BottomNav /></></AuthGuard>} />
          <Route path="/marketplace" element={<AuthGuard><><Marketplace /><MomAlerts /><BottomNav /></></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard><><Profile /><MomAlerts /><BottomNav /></></AuthGuard>} />
          <Route path="/privacy-terms" element={<PrivacyTerms />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
