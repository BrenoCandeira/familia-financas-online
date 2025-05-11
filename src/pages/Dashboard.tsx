import React, { useState, useMemo } from "react";
import { useFinance } from "../contexts/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "../utils/formatters";
import { ArrowDown, ArrowUp, Wallet, CreditCard, Target } from "lucide-react";
import { CashFlow } from "@/components/dashboard/CashFlow";
import { ExpensesByCategory } from "@/components/dashboard/ExpensesByCategory";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { startOfYear, endOfYear } from "date-fns";

class DashboardErrorBoundary extends React.Component<{children: React.ReactNode}, {error: Error | null}> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: any) {
    console.error('Erro no Dashboard:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="p-8 text-center text-red-700 bg-red-100">
          <h2 className="text-xl font-bold mb-2">Erro ao carregar o dashboard</h2>
          <pre className="text-xs whitespace-pre-wrap">{this.state.error.message}</pre>
          <p>Veja o console do navegador para mais detalhes.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const Dashboard = () => {
  const { 
    accounts, 
    creditCards,
    categories,
    goals,
    transactions,
    dashboardData,
    isLoading 
  } = useFinance();

  // Filtros
  const currentYear = new Date().getFullYear();
  const [period, setPeriod] = useState<"year" | "month" | "custom">("year");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [selectedCard, setSelectedCard] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<"all" | "entrada" | "saída">("all");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  // Filtragem das transações para os gráficos e cards
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];
    // Período
    if (period === "year") {
      const start = startOfYear(new Date());
      const end = endOfYear(new Date());
      filtered = filtered.filter(t => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      });
    } else if (period === "month" && selectedMonth) {
      const [year, month] = selectedMonth.split("-").map(Number);
      filtered = filtered.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      });
    } else if (period === "custom" && customStart && customEnd) {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      filtered = filtered.filter(t => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      });
    }
    // Categoria
    if (selectedCategory !== "all") filtered = filtered.filter(t => t.categoryId === selectedCategory);
    // Conta
    if (selectedAccount !== "all") filtered = filtered.filter(t => t.accountId === selectedAccount);
    // Cartão
    if (selectedCard !== "all") filtered = filtered.filter(t => t.creditCardId === selectedCard);
    // Tipo
    if (selectedType !== "all") filtered = filtered.filter(t => t.type === selectedType);
    return filtered;
  }, [transactions, period, selectedMonth, customStart, customEnd, selectedCategory, selectedAccount, selectedCard, selectedType]);

  console.log('Dashboard render', { isLoading, accounts, creditCards, categories, goals, transactions, dashboardData });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Carregando dados...</p>
      </div>
    );
  }

  return (
    <DashboardErrorBoundary>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das suas finanças
          </p>
        </div>

        {/* Filtros do dashboard */}
        <Card className="mb-4">
          <CardContent className="flex flex-wrap gap-4 pt-6">
            <div>
              <Label>Período</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Ano Corrente</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {period === "month" && (
              <div>
                <Label>Mês</Label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="w-36"
                />
              </div>
            )}
            {period === "custom" && (
              <>
                <div>
                  <Label>Início</Label>
                  <Input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="w-36" />
                </div>
                <div>
                  <Label>Fim</Label>
                  <Input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="w-36" />
                </div>
              </>
            )}
            <div>
              <Label>Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Conta</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cartão</Label>
              <Select value={selectedCard} onValueChange={setSelectedCard}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {creditCards.map(card => (
                    <SelectItem key={card.id} value={card.id}>{card.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={selectedType} onValueChange={v => setSelectedType(v as any)}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="entrada">Entradas</SelectItem>
                  <SelectItem value="saída">Saídas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="accounts">Contas</TabsTrigger>
            <TabsTrigger value="expenses">Despesas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Resumo Financeiro */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Saldo Total
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(filteredTransactions.reduce((sum, t) => t.type === "entrada" ? sum + t.amount : sum - t.amount, 0))}</div>
                  <p className="text-xs text-muted-foreground">
                    {accounts.length} contas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Limite de Crédito
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(creditCards.reduce((sum, card) => sum + card.limit, 0))}</div>
                  <p className="text-xs text-muted-foreground">
                    {creditCards.length} cartões
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Entradas
                  </CardTitle>
                  <ArrowUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(filteredTransactions.filter(t => t.type === "entrada").reduce((sum, t) => sum + t.amount, 0))}</div>
                  <p className="text-xs text-muted-foreground">
                    {filteredTransactions.filter(t => t.type === "entrada").length} transações
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Saídas
                  </CardTitle>
                  <ArrowDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(filteredTransactions.filter(t => t.type === "saída").reduce((sum, t) => sum + t.amount, 0))}</div>
                  <p className="text-xs text-muted-foreground">
                    {filteredTransactions.filter(t => t.type === "saída").length} transações
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid gap-4 md:grid-cols-2">
              <CashFlow transactions={filteredTransactions || []} goals={goals || []} />
              <ExpensesByCategory transactions={filteredTransactions || []} categories={categories || []} />
            </div>

            {/* Transações Recentes */}
            <RecentTransactions transactions={filteredTransactions ? filteredTransactions.slice(0, 10) : []} />

            {/* Metas */}
            <Card>
              <CardHeader>
                <CardTitle>Metas Financeiras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4" style={{ color: goal.color }} />
                        <span>{goal.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round((goal.currentAmount / goal.targetAmount) * 100)}% concluído
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            {/* Contas */}
            <Card>
              <CardHeader>
                <CardTitle>Contas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Wallet className="h-4 w-4" style={{ color: account.color }} />
                        <span>{account.name}</span>
                      </div>
                      <div className="font-medium">{formatCurrency(account.balance)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cartões de Crédito */}
            <Card>
              <CardHeader>
                <CardTitle>Cartões de Crédito</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {creditCards.map((card) => (
                    <div key={card.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" style={{ color: card.color }} />
                        <span>{card.name}</span>
                      </div>
                      <div className="font-medium">{formatCurrency(card.limit)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            {/* Despesas por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ExpensesByCategory transactions={filteredTransactions} categories={categories} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardErrorBoundary>
  );
};

export default Dashboard;
