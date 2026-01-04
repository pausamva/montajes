import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfigEditor } from "./components/config-editor"
import { BudgetHeader } from "./components/budget-header"
import { LinesTable } from "./components/lines-table"
import { TotalsSummary } from "./components/totals-summary"
import { useStore } from "@/core/store"
import { saveBudgetToFile, loadBudgetFromFile } from "@/services/persistence"
import { generatePurchaseOrderPDF } from "@/services/pdf-export"
import { FileDown, FolderOpen, Printer, Plus, Moon, Sun } from "lucide-react"

function App() {
  const { budget, setBudget, resetBudget } = useStore();
  const [isDark, setIsDark] = useState(true);

  // Initialize theme from HTML class or localStorage
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSave = async () => {
    await saveBudgetToFile(budget);
  };

  const handleLoad = async () => {
    const loaded = await loadBudgetFromFile();
    if (loaded) {
      setBudget(loaded);
    }
  };

  const handleExport = () => {
    generatePurchaseOrderPDF(budget);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="border-b bg-card sticky top-0 z-10 transition-colors duration-300">
        <div className="container mx-auto py-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">Montajes</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">v2.0</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} title={isDark ? "Modo Claro" : "Modo Oscuro"}>
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <div className="w-px h-8 bg-border mx-1"></div>
            <Button variant="outline" size="sm" onClick={handleLoad} title="Cargar">
              <FolderOpen className="w-4 h-4 mr-2" />
              Abrir
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} title="Guardar">
              <FileDown className="w-4 h-4 mr-2" />
              Guardar
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} title="PDF">
              <Printer className="w-4 h-4 mr-2" />
              Orden de Compra
            </Button>
            <Button size="sm" onClick={resetBudget} variant="default">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8 px-4 transition-colors duration-300">
        <Tabs defaultValue="editor" className="space-y-4">
          <TabsList>
            <TabsTrigger value="editor">Editor de Presupuesto</TabsTrigger>
            <TabsTrigger value="config">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            <BudgetHeader />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <LinesTable />
              </div>
              <div>
                <div className="sticky top-20">
                  <TotalsSummary />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="config">
            <ConfigEditor />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App
