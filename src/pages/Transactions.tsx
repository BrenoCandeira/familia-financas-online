import { useState } from "react";
import { useFinance } from "../contexts/FinanceContext";
import { Transaction } from "../types";
import { formatCurrency, formatDate, getTransactionTypeColor, formatInstallment } from "../utils/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CreditCard, Search, Trash2, Plus } from "lucide-react";
import { mockUsers } from "../data/mockData";

const Transactions = () => {
  const { 
    transactions, 
    categories, 
    accounts, 
    creditCards,
    deleteTransaction,
    selectedPeriod,
    setSelectedPeriod,
    filteredUserId,
    setFilteredUserId,
    filteredAccountId,
    setFilteredAccountId,
    filteredCreditCardId,
    setFilteredCreditCardId
  } = useFinance();
  
  const [transactionType, setTransactionType] = useState<"all" | "entrada" | "saída">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  const handleDeleteTransaction = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteDialogOpen(true);
  };

  // Filtering logic
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by type
    if (transactionType !== "all" && transaction.type !== transactionType) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by user
    if (filteredUserId && transaction.userId !== filteredUserId) {
      return false;
    }
    
    // Filter by account
    if (filteredAccountId && transaction.accountId !== filteredAccountId) {
      return false;
    }
    
    // Filter by credit card
    if (filteredCreditCardId && transaction.creditCardId !== filteredCreditCardId) {
      return false;
    }
    
    return true;
  });

  // Sort by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getCategory = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
  };

  const getAccount = (accountId?: string) => {
    if (!accountId) return null;
    return accounts.find(a => a.id === accountId);
  };

  const getCreditCard = (creditCardId?: string) => {
    if (!creditCardId) return null;
    return creditCards.find(c => c.id === creditCardId);
  };

  const getUser = (userId: string) => {
    return mockUsers.find(u => u.id === userId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Transações</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie suas transações
          </p>
        </div>
        
        <Button onClick={() => window.location.href = "/transactions/new"}>
          <Plus className="mr-2 h-4 w-4" /> Nova transação
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-3/4 space-y-4">
          {/* Filtros rápidos */}
          <Tabs 
            defaultValue="all"
            value={transactionType} 
            onValueChange={(v) => setTransactionType(v as "all" | "entrada" | "saída")}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="entrada" className="text-financial-income">Entradas</TabsTrigger>
              <TabsTrigger value="saída" className="text-financial-expense">Saídas</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Barra de pesquisa */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar transações..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Lista de transações */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Transações</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-medium text-muted-foreground">
                        <th className="pb-2 pl-2">Data</th>
                        <th className="pb-2">Descrição</th>
                        <th className="pb-2">Categoria</th>
                        <th className="pb-2">Conta/Cartão</th>
                        <th className="pb-2 text-right">Valor</th>
                        <th className="pb-2 text-right pr-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sortedTransactions.map((transaction) => {
                        const category = getCategory(transaction.categoryId);
                        const account = getAccount(transaction.accountId);
                        const creditCard = getCreditCard(transaction.creditCardId);
                        const user = getUser(transaction.userId);
                        
                        return (
                          <tr key={transaction.id} className="hover:bg-secondary/50">
                            <td className="py-3 pl-2 whitespace-nowrap">
                              {formatDate(new Date(transaction.date))}
                            </td>
                            <td className="py-3">
                              <div>
                                <span className="font-medium">{transaction.description}</span>
                                {transaction.installments && transaction.installments > 1 && (
                                  <span className="ml-1 text-xs bg-secondary px-1 rounded-sm">
                                    {formatInstallment(transaction.currentInstallment, transaction.installments)}
                                  </span>
                                )}
                              </div>
                              {user && (
                                <span className="text-xs text-muted-foreground">
                                  Por: {user.name}
                                </span>
                              )}
                            </td>
                            <td className="py-3">
                              {category && (
                                <div className="flex items-center">
                                  <span
                                    className="h-3 w-3 rounded-full mr-2"
                                    style={{ backgroundColor: category.color }}
                                  />
                                  <span>{category.name}</span>
                                </div>
                              )}
                            </td>
                            <td className="py-3">
                              {account ? (
                                <div className="flex items-center">
                                  <span
                                    className="h-3 w-3 rounded-full mr-2"
                                    style={{ backgroundColor: account.color }}
                                  />
                                  <span>{account.name}</span>
                                </div>
                              ) : creditCard ? (
                                <div className="flex items-center">
                                  <CreditCard 
                                    className="h-3 w-3 mr-2" 
                                    style={{ color: creditCard.color }}
                                  />
                                  <span>{creditCard.name}</span>
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className={`py-3 text-right font-medium ${getTransactionTypeColor(transaction.type)}`}>
                              {transaction.type === "entrada" ? "+" : "-"}
                              {formatCurrency(transaction.amount)}
                            </td>
                            <td className="py-3 text-right pr-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(transaction)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma transação encontrada com os filtros selecionados
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:w-1/4 space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Período</Label>
                <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)}>
                  <SelectTrigger>
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thisMonth">Este mês</SelectItem>
                    <SelectItem value="lastMonth">Mês passado</SelectItem>
                    <SelectItem value="thisYear">Este ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Usuário</Label>
                <Select
                  value={filteredUserId || "all"}
                  onValueChange={(v) => setFilteredUserId(v === "all" ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {mockUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Conta</Label>
                <Select
                  value={filteredAccountId || "all"}
                  onValueChange={(v) => setFilteredAccountId(v === "all" ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Conta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Cartão de crédito</Label>
                <Select
                  value={filteredCreditCardId || "all"}
                  onValueChange={(v) => setFilteredCreditCardId(v === "all" ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cartão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {creditCards.map(card => (
                      <SelectItem key={card.id} value={card.id}>
                        {card.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setTransactionType("all");
                  setSearchTerm("");
                  setFilteredUserId(null);
                  setFilteredAccountId(null);
                  setFilteredCreditCardId(null);
                  setSelectedPeriod("thisMonth");
                }}
              >
                Limpar filtros
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Transaction Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir transação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {transactionToDelete && (
              <p>
                Descrição: <strong>{transactionToDelete.description}</strong>
                <br />
                Valor: <strong className={getTransactionTypeColor(transactionToDelete.type)}>
                  {transactionToDelete.type === "entrada" ? "+" : "-"}
                  {formatCurrency(transactionToDelete.amount)}
                </strong>
                <br />
                Data: <strong>{formatDate(new Date(transactionToDelete.date))}</strong>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteTransaction}>
              Excluir transação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
