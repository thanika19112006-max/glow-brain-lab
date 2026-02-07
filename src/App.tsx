import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import BrainMaze from "./pages/games/BrainMaze";
import MemoryFlip from "./pages/games/MemoryFlip";
import ThinkFast from "./pages/games/ThinkFast";
import ReflexIQ from "./pages/games/ReflexIQ";
import WordBend from "./pages/games/WordBend";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/games/brainmaze" element={<BrainMaze />} />
          <Route path="/games/memoryflip" element={<MemoryFlip />} />
          <Route path="/games/thinkfast" element={<ThinkFast />} />
          <Route path="/games/reflexiq" element={<ReflexIQ />} />
          <Route path="/games/wordbend" element={<WordBend />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
