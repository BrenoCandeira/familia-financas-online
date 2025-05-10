import { useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import { Transaction } from "@/types";
import { CreditCard, Wallet } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  const { categories, accounts, creditCards } = useFinance();

  const getCategory = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
  };

  const getAccount = (accountId: string) => {
    return accounts.find(a => a.id === accountId);
  };

  const getCreditCard = (creditCardId: string) => {
    return creditCards.find(c => c.id === creditCardId);
  };

  const sortedTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedTransactions.map((transaction) => {
            const category = getCategory(transaction.categoryId);
            const account = transaction.accountId ? getAccount(transaction.accountId) : null;
            const creditCard = transaction.creditCardId ? getCreditCard(transaction.creditCardId) : null;

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: category?.color || "#888" }}
                  >
                    {category?.icon || "💰"}
                  </div>
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {category?.name} • {format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      {account ? (
                        <>
                          <Wallet className="h-3 w-3 mr-1" />
                          {account.name}
                        </>
                      ) : creditCard ? (
                        <>
                          <CreditCard className="h-3 w-3 mr-1" />
                          {creditCard.name}
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className={`font-medium ${transaction.type === "entrada" ? "text-green-500" : "text-red-500"}`}>
                  {transaction.type === "entrada" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
