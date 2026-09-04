import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { MoodifyProvider } from "@/context/MoodifyContext";
import { AppShell } from "@/components/layout/AppShell";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import NowSpinning from "@/pages/NowSpinning";
import Agenda from "@/pages/Agenda";

function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/explore" component={Explore} />
        <Route path="/now-spinning" component={NowSpinning} />
        <Route path="/agenda" component={Agenda} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MoodifyProvider>
        <Router />
        <Toaster />
      </MoodifyProvider>
    </QueryClientProvider>
  );
}

export default App;
