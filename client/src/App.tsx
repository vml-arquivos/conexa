import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import HomeCoCris from "./pages/HomeCoCris";
import Login from "./pages/auth/Login";
import Overview from "./pages/dashboard/Overview";
import DashboardLayout from "./layouts/DashboardLayout";
import PlanejamentosList from "./pages/dashboard/PlanejamentosList";
import MaterialRequest from "./pages/dashboard/MaterialRequest";
import DiarioBordoRapido from "./pages/dashboard/DiarioBordoRapido";
import PlanejamentoDia from "./pages/dashboard/PlanejamentoDia";
import NovoPlanejamento from "./pages/dashboard/NovoPlanejamento";
import AutomacaoView from "./pages/dashboard/AutomacaoView";
import TarefasList from "./pages/dashboard/TarefasList";
import NovaTarefa from "./pages/dashboard/NovaTarefa";
import CorrecaoTarefa from "./pages/dashboard/CorrecaoTarefa";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeCoCris} />
      <Route path="/old" component={Home} />
      <Route path="/login" component={Login} />
      
      {/* Dashboard Routes */}
      <Route path="/dashboard">
        <DashboardLayout>
          <Overview />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/planejamentos">
        <DashboardLayout>
          <PlanejamentosList />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/planejamentos/novo">
        <DashboardLayout>
          <NovoPlanejamento />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/automacao">
        <DashboardLayout>
          <AutomacaoView />
        </DashboardLayout>
      </Route>
      
      {/* Mobile-First Routes */}
      <Route path="/dashboard/materiais">
        <DashboardLayout>
          <MaterialRequest />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/diario-rapido">
        <DashboardLayout>
          <DiarioBordoRapido />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/planejamento-dia">
        <DashboardLayout>
          <PlanejamentoDia />
        </DashboardLayout>
      </Route>
      
      {/* Tarefas Routes */}
      <Route path="/dashboard/tarefas">
        <DashboardLayout>
          <TarefasList />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/tarefas/nova">
        <DashboardLayout>
          <NovaTarefa />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/tarefas/:id/correcao">
        <DashboardLayout>
          <CorrecaoTarefa />
        </DashboardLayout>
      </Route>
      
      <Route path="/404" component={NotFound} />
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
