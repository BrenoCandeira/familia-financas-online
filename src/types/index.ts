
export type UserRole = "responsável" | "participante";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Account {
  id: string;
  name: string;
  type: string; // "corrente", "poupança", "carteira", etc.
  balance: number;
  color?: string;
  icon?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  dueDate: number; // Dia do mês
  closeDate: number; // Dia do mês
  color?: string;
  icon?: string;
}

export type CategoryType = "entrada" | "saída" | "ambos";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon?: string;
  isDefault?: boolean;
}

export type TransactionType = "entrada" | "saída";

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // ISO date string
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
  deadline: string; // ISO date string
  color?: string;
  icon?: string;
}

export interface DashboardData {
  totalBalance: number;
  accountBalances: { accountId: string; balance: number; name: string; color?: string }[];
  categoryExpenses: { categoryId: string; amount: number; name: string; color: string }[];
  incomeVsExpense: { income: number; expense: number };
  recentTransactions: Transaction[];
}
