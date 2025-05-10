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

export interface FinanceContextType {
  accounts: Account[];
  creditCards: CreditCard[];
  categories: Category[];
  transactions: Transaction[];
  goals: Goal[];
  selectedPeriod: "thisMonth" | "lastMonth" | "thisYear" | "custom";
  startDate: Date | null;
  endDate: Date | null;
  filteredUserId: string | null;
  filteredAccountId: string | null;
  filteredCreditCardId: string | null;
  dashboardData: DashboardData | null;
  isLoading: boolean;
  
  addAccount: (account: Omit<Account, "id">) => Promise<void>;
  updateAccount: (account: Account) => Promise<void>;
  deleteAccount: (accountId: string) => Promise<void>;
  
  addCreditCard: (creditCard: Omit<CreditCard, "id">) => Promise<void>;
  updateCreditCard: (creditCard: CreditCard) => Promise<void>;
  deleteCreditCard: (creditCardId: string) => Promise<void>;
  
  addCategory: (category: Omit<Category, "id">) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  
  addGoal: (goal: Omit<Goal, "id">) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  
  setSelectedPeriod: (period: "thisMonth" | "lastMonth" | "thisYear" | "custom") => void;
  setDateRange: (startDate: Date | null, endDate: Date | null) => void;
  setFilteredUserId: (userId: string | null) => void;
  setFilteredAccountId: (accountId: string | null) => void;
  setFilteredCreditCardId: (creditCardId: string | null) => void;
  
  fetchData: () => Promise<void>;
} 