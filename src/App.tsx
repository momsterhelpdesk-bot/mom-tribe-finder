import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ProfileSetup from "./pages/ProfileSetup";
import PhotoVerification from "./pages/PhotoVerification";
import Admin from "./pages/Admin";
import Discover from "./pages/Discover";
import Chats from "./pages/Chats";
import ChatView from "./pages/ChatView";
import AskMoms from "./pages/AskMoms";
import Marketplace from "./pages/Marketplace";
import Profile from "./pages/Profile";
import PrivacyTerms from "./pages/PrivacyTerms";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import AuthGuard from "./components/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth-callback" element={<AuthCallback />} />
          <Route path="/profile-setup" element={<AuthGuard><ProfileSetup /></AuthGuard>} />
          <Route path="/photo-verification" element={<AuthGuard><PhotoVerification /></AuthGuard>} />
          <Route path="/admin" element={<AuthGuard><Admin /></AuthGuard>} />
          <Route path="/discover" element={<AuthGuard><><Discover /><BottomNav /></></AuthGuard>} />
          <Route path="/chats" element={<AuthGuard><><Chats /><BottomNav /></></AuthGuard>} />
          <Route path="/chat/:matchId" element={<AuthGuard><ChatView /></AuthGuard>} />
          <Route path="/ask-moms" element={<AuthGuard><><AskMoms /><BottomNav /></></AuthGuard>} />
          <Route path="/marketplace" element={<AuthGuard><><Marketplace /><BottomNav /></></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard><><Profile /><BottomNav /></></AuthGuard>} />
          <Route path="/privacy-terms" element={<PrivacyTerms />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
