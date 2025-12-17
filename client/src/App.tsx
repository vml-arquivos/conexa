import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/auth/Login";
import DashboardLayout from "./layouts/DashboardLayout";

// Páginas
import Home from "./pages/Home";
import Overview from "./pages/dashboard/Overview";
import AlunosList from "./pages/dashboard/AlunosList";
import EstoqueCompleto from "./pages/dashboard/EstoqueCompleto";
import Funcionarios from "./pages/dashboard/Funcionarios";
import GestaoCompras from "./pages/dashboard/GestaoCompras";
import AutomacaoView from "./pages/dashboard/AutomacaoView";

// Páginas adicionais (se existirem)
import PlanejamentosList from "./pages/dashboard/PlanejamentosList";
import NovoPlanejamento from "./pages/dashboard/NovoPlanejamento";
import TarefasList from "./pages/dashboard/TarefasList";
import NovaTarefa from "./pages/dashboard/NovaTarefa";
import CorrecaoTarefa from "./pages/dashboard/CorrecaoTarefa";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />

      {/* ÁREA ADMINISTRATIVA */}
      <Route path="/dashboard">
        <DashboardLayout><Overview /></DashboardLayout>
      </Route>

      {/* ALUNOS */}
      <Route path="/dashboard/alunos">
        <DashboardLayout><AlunosList /></DashboardLayout>
      </Route>
      <Route path="/dashboard/alunos/novo">
        <DashboardLayout><AlunosList /></DashboardLayout>
      </Route>

      {/* RH & FUNCIONÁRIOS (NOVO) */}
      <Route path="/dashboard/funcionarios">
        <DashboardLayout><Funcionarios /></DashboardLayout>
      </Route>

      {/* ESTOQUE & COMPRAS (NOVO) */}
      <Route path="/dashboard/estoque">
        <DashboardLayout><EstoqueCompleto /></DashboardLayout>
      </Route>
      <Route path="/dashboard/compras">
        <DashboardLayout><GestaoCompras /></DashboardLayout>
      </Route>

      {/* AUTOMAÇÃO */}
      <Route path="/dashboard/automacao">
        <DashboardLayout><AutomacaoView /></DashboardLayout>
      </Route>

      {/* PLANEJAMENTOS (Legado) */}
      <Route path="/dashboard/planejamentos">
        <DashboardLayout><PlanejamentosList /></DashboardLayout>
      </Route>
      <Route path="/dashboard/planejamentos/novo">
        <DashboardLayout><NovoPlanejamento /></DashboardLayout>
      </Route>

      {/* TAREFAS (Legado) */}
      <Route path="/dashboard/tarefas">
        <DashboardLayout><TarefasList /></DashboardLayout>
      </Route>
      <Route path="/dashboard/tarefas/nova">
        <DashboardLayout><NovaTarefa /></DashboardLayout>
      </Route>
      <Route path="/dashboard/tarefas/:id/correcao">
        <DashboardLayout><CorrecaoTarefa /></DashboardLayout>
      </Route>

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
