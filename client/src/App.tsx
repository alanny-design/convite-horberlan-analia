import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { findGuestBySlug } from "./lib/guests";
import Home from "./pages/Home";
import Photos from "./pages/Photos";


function GuestInvite({ params }: { params: { slug: string } }) {
  const guestName = findGuestBySlug(params.slug);
  if (!guestName) return <NotFound />;
  return <Home guestName={guestName} />;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"}>
        <Home />
      </Route>
      <Route path={"/convite/:slug"} component={GuestInvite} />
      <Route path={"/fotos"} component={Photos} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
