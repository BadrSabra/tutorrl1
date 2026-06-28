import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/app-layout";

import Home from "@/pages/home";
import Subjects from "@/pages/subjects";
import Placement from "@/pages/placement";
import Chat from "@/pages/chat";
import Progress from "@/pages/progress";
import Settings from "@/pages/settings";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/">
        <AppLayout hideSidebar><Home /></AppLayout>
      </Route>
      <Route path="/subjects">
        <AppLayout><Subjects /></AppLayout>
      </Route>
      <Route path="/placement">
        <AppLayout><Placement /></AppLayout>
      </Route>
      <Route path="/chat">
        <AppLayout hideSidebar><Chat /></AppLayout>
      </Route>
      <Route path="/progress">
        <AppLayout><Progress /></AppLayout>
      </Route>
      <Route path="/settings">
        <AppLayout><Settings /></AppLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
