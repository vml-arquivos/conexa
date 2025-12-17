import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, AlertTriangle, Heart } from "lucide-react";
import { Link } from "wouter";
import { ALUNOS } from "@/data/mockData";

export default function AlunosList() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAlunos = ALUNOS.filter(aluno =>
    aluno.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.turma.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
          <p className="text-muted-foreground mt-2">Gerencie todos os alunos do sistema</p>
        </div>
        <Link href="/dashboard/alunos/novo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Aluno
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou turma..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAlunos.map((aluno) => {
          const isRiscoEvasao = aluno.faltasConsecutivas > 30;
          const temProblemasSaude = aluno.saude.length > 0;

          return (
            <Card
              key={aluno.id}
              className={`transition-all ${
                isRiscoEvasao
                  ? "border-red-500/50 bg-red-50/30 dark:bg-red-950/20"
                  : temProblemasSaude
                  ? "border-yellow-500/50 bg-yellow-50/30 dark:bg-yellow-950/20"
                  : ""
              }`}
              style={{
                borderWidth: isRiscoEvasao ? "2px" : "1px",
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={aluno.foto}
                      alt={aluno.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <CardTitle className="text-base">{aluno.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {aluno.turma}
                      </CardDescription>
                    </div>
                  </div>
                  {isRiscoEvasao && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Risco
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Faltas Consecutivas</p>
                    <p className="font-semibold text-lg">{aluno.faltasConsecutivas}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Faltas Totais</p>
                    <p className="font-semibold text-lg">{aluno.faltasTotal}</p>
                  </div>
                </div>

                {temProblemasSaude && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Heart className="h-3 w-3 text-orange-500" />
                      Informações de Saúde
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {aluno.saude.map((info, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="bg-yellow-100/80 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200 text-xs"
                        >
                          {info}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {isRiscoEvasao && (
                  <div className="bg-red-100/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded p-2">
                    <p className="text-xs text-red-700 dark:text-red-200">
                      ⚠️ Aluno com risco de evasão. Recomenda-se contato com responsáveis.
                    </p>
                  </div>
                )}

                <Button variant="outline" size="sm" className="w-full">
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAlunos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Nenhum aluno encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
