export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  color?: string;
  icon?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  dueDate: string;
  closeDate: string;
  color?: string;
  icon?: string;
}

export interface Category {
  id: string;
  name: string;
  type: "entrada" | "saída" | "ambos";
  color: string;
  icon?: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: "entrada" | "saída";
  categoryId: string;
  date: string;
  description: string;
  accountId?: string;
  creditCardId?: string;
  notes?: string;
  installments?: number;
  currentInstallment?: number;
  userId: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color?: string;
  icon?: string;
}

export interface DashboardData {
  totalBalance: number;
  accountBalances: {
    accountId: string;
    name: string;
    balance: number;
    color?: string;
  }[];
  categoryExpenses: {
    categoryId: string;
    amount: number;
    name: string;
    color: string;
  }[];
  incomeVsExpense: {
    income: number;
    expense: number;
  };
  recentTransactions: Transaction[];
} 