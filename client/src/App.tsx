import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { findGuestBySlug } from "./lib/guests";
import Home from "./pages/Home";


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
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

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
