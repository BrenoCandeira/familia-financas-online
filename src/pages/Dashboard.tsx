import { useFinance } from "../contexts/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "../utils/formatters";
import { ArrowDown, ArrowUp, Wallet, CreditCard, Target } from "lucide-react";

const Dashboard = () => {
  const { 
    accounts, 
    creditCards,
    goals,
    dashboardData,
    isLoading 
  } = useFinance();

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das suas finanças
        </p>
      </div>

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
                <div className="text-2xl font-bold">{formatCurrency(dashboardData.totalBalance)}</div>
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
                  Entradas do Mês
                </CardTitle>
                <ArrowUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(dashboardData.incomeVsExpense.income)}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.recentTransactions.filter(t => t.type === "entrada").length} transações
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Saídas do Mês
                </CardTitle>
                <ArrowDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(dashboardData.incomeVsExpense.expense)}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.recentTransactions.filter(t => t.type === "saída").length} transações
                </p>
              </CardContent>
            </Card>
          </div>

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
                {dashboardData.categoryExpenses.map((expense) => (
                  <div key={expense.categoryId} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: expense.color }}
                      />
                      <span>{expense.name}</span>
                    </div>
                    <div className="font-medium">{formatCurrency(expense.amount)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
