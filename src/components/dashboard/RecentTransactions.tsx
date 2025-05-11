import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types/finance";
import { formatCurrency, formatDate, getTransactionTypeColor } from "@/utils/formatters";
import { useFinance } from "@/contexts/FinanceContext";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
  const { categories, accounts, creditCards } = useFinance();

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const category = getCategory(transaction.categoryId);
            const account = getAccount(transaction.accountId);
            const creditCard = getCreditCard(transaction.creditCardId);
            
            return (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category?.color }}
                  />
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {category?.name} • {account ? account.name : creditCard?.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${getTransactionTypeColor(transaction.type)}`}>
                    {transaction.type === "entrada" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(new Date(transaction.date))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
