import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Plus, AlertTriangle } from "lucide-react";
import { ESTOQUE } from "@/data/mockData";

const CATEGORIAS = ["Higiene", "Pedagógico", "Alimentação"];

export default function EstoqueCompleto() {
  const [estoque, setEstoque] = useState(ESTOQUE);

  const handleReporEstoque = (id: number) => {
    setEstoque(estoque.map(item =>
      item.id === id ? { ...item, qtd: item.min * 2 } : item
    ));
  };

  const renderTabContent = (categoria: string) => {
    const itensCategoria = estoque.filter(item => item.category === categoria);

    return (
      <div className="space-y-4">
        {itensCategoria.map((item) => {
          const precisaRepor = item.qtd < item.min;

          return (
            <Card key={item.id} className={precisaRepor ? "border-red-200 bg-red-50/30 dark:bg-red-950/20" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{item.item}</h3>
                      {precisaRepor && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Crítico
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Quantidade</p>
                        <p className="font-semibold text-lg">{item.qtd}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Mínimo</p>
                        <p className="font-semibold text-lg">{item.min}</p>
                      </div>
                    </div>
                  </div>

                  {precisaRepor ? (
                    <Button
                      onClick={() => handleReporEstoque(item.id)}
                      className="bg-red-600 hover:bg-red-700 text-white gap-2 h-auto py-3"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs font-semibold">Repor Estoque</span>
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      OK
                    </Button>
                  )}
                </div>

                {precisaRepor && (
                  <div className="mt-3 bg-red-100/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded p-2">
                    <p className="text-xs text-red-700 dark:text-red-200">
                      Quantidade abaixo do mínimo. Reposição necessária!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {itensCategoria.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">Nenhum item nesta categoria</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const itensComProblema = estoque.filter(item => item.qtd < item.min).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estoque Completo</h1>
          <p className="text-muted-foreground mt-2">Gerencie o inventário da instituição</p>
        </div>
        {itensComProblema > 0 && (
          <Badge variant="destructive" className="gap-2 px-3 py-1.5">
            <AlertTriangle className="h-4 w-4" />
            {itensComProblema} item(ns) crítico(s)
          </Badge>
        )}
      </div>

      <Tabs defaultValue="Higiene" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {CATEGORIAS.map((categoria) => (
            <TabsTrigger key={categoria} value={categoria}>
              {categoria}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIAS.map((categoria) => (
          <TabsContent key={categoria} value={categoria} className="space-y-4">
            {renderTabContent(categoria)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
