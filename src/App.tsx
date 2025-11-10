import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import PhotoVerification from "./pages/PhotoVerification";
import Admin from "./pages/Admin";
import Discover from "./pages/Discover";
import Chats from "./pages/Chats";
import Events from "./pages/Events";
import Marketplace from "./pages/Marketplace";
import Map from "./pages/Map";
import Profile from "./pages/Profile";
import PrivacyTerms from "./pages/PrivacyTerms";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";

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
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/photo-verification" element={<PhotoVerification />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/discover" element={<><Discover /><BottomNav /></>} />
          <Route path="/chats" element={<><Chats /><BottomNav /></>} />
          <Route path="/events" element={<><Events /><BottomNav /></>} />
          <Route path="/marketplace" element={<><Marketplace /><BottomNav /></>} />
          <Route path="/map" element={<><Map /><BottomNav /></>} />
          <Route path="/profile" element={<><Profile /><BottomNav /></>} />
          <Route path="/privacy-terms" element={<PrivacyTerms />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
