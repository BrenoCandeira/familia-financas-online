import { Account, Category, CreditCard, Goal, Transaction, User } from "../types";

// Usuários
export const mockUsers: User[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@familia.com",
    role: "responsável",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: "2",
    name: "Maria Silva",
    email: "maria@familia.com",
    role: "responsável",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: "3",
    name: "Pedro Silva",
    email: "pedro@familia.com",
    role: "participante",
    avatarUrl: "https://i.pravatar.cc/150?img=8",
  },
];

// Contas
export const mockAccounts: Account[] = [
  {
    id: "1",
    name: "Conta Corrente",
    type: "corrente",
    balance: 5250.75,
    color: "#3B82F6",
    icon: "wallet",
  },
  {
    id: "2",
    name: "Poupança",
    type: "poupança",
    balance: 12500.00,
    color: "#10B981",
    icon: "piggy-bank",
  },
  {
    id: "3",
    name: "Carteira",
    type: "carteira",
    balance: 350.25,
    color: "#F59E0B",
    icon: "wallet",
  },
];

// Cartões de crédito
export const mockCreditCards: CreditCard[] = [
  {
    id: "1",
    name: "Nubank",
    limit: 8000,
    dueDate: 15,
    closeDate: 8,
    color: "#8B5CF6",
    icon: "credit-card",
  },
  {
    id: "2",
    name: "Itaú",
    limit: 5000,
    dueDate: 10,
    closeDate: 3,
    color: "#EF4444",
    icon: "credit-card",
  },
];

// Categorias
export const mockCategories: Category[] = [
  { id: "1", name: "Salário", type: "entrada", color: "#10B981", isDefault: true },
  { id: "2", name: "Investimentos", type: "entrada", color: "#3B82F6", isDefault: true },
  { id: "3", name: "Presentes", type: "entrada", color: "#8B5CF6", isDefault: true },
  { id: "4", name: "Outros (Entrada)", type: "entrada", color: "#F59E0B", isDefault: true },
  
  { id: "5", name: "Alimentação", type: "saída", color: "#EF4444", isDefault: true },
  { id: "6", name: "Moradia", type: "saída", color: "#F59E0B", isDefault: true },
  { id: "7", name: "Transporte", type: "saída", color: "#8B5CF6", isDefault: true },
  { id: "8", name: "Saúde", type: "saída", color: "#EC4899", isDefault: true },
  { id: "9", name: "Educação", type: "saída", color: "#3B82F6", isDefault: true },
  { id: "10", name: "Lazer", type: "saída", color: "#10B981", isDefault: true },
  { id: "11", name: "Assinaturas", type: "saída", color: "#6B7280", isDefault: true },
  { id: "12", name: "Outros (Saída)", type: "saída", color: "#9CA3AF", isDefault: true },
];

// Transações
const currentDate = new Date();
const previousMonth = new Date(currentDate);
previousMonth.setMonth(previousMonth.getMonth() - 1);

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    amount: 5000,
    type: "entrada",
    categoryId: "1", // Salário
    date: currentDate.toISOString(),
    description: "Salário mensal",
    accountId: "1",
    notes: "Depósito realizado",
    userId: "1",
  },
  {
    id: "2",
    amount: 1200,
    type: "saída",
    categoryId: "6", // Moradia
    date: currentDate.toISOString(),
    description: "Aluguel",
    accountId: "1",
    notes: "",
    userId: "1",
  },
  {
    id: "3",
    amount: 350,
    type: "saída",
    categoryId: "5", // Alimentação
    date: currentDate.toISOString(),
    description: "Supermercado",
    creditCardId: "1",
    notes: "Compras da semana",
    userId: "2",
  },
  {
    id: "4",
    amount: 98.90,
    type: "saída",
    categoryId: "11", // Assinaturas
    date: currentDate.toISOString(),
    description: "Netflix + Spotify",
    creditCardId: "1",
    notes: "",
    userId: "1",
  },
  {
    id: "5",
    amount: 2500,
    type: "entrada",
    categoryId: "2", // Investimentos
    date: previousMonth.toISOString(),
    description: "Dividendos",
    accountId: "2",
    notes: "Rendimentos mensais",
    userId: "1",
  },
  {
    id: "6",
    amount: 899.90,
    type: "saída",
    categoryId: "7", // Transporte
    date: previousMonth.toISOString(),
    description: "Seguro do carro",
    creditCardId: "2",
    notes: "Pagamento parcelado",
    installments: 12,
    currentInstallment: 3,
    userId: "1",
  },
  {
    id: "7",
    amount: 120,
    type: "saída",
    categoryId: "10", // Lazer
    date: currentDate.toISOString(),
    description: "Cinema e jantar",
    accountId: "3",
    notes: "Saída em família",
    userId: "2",
  },
  {
    id: "8",
    amount: 450,
    type: "saída",
    categoryId: "9", // Educação
    date: currentDate.toISOString(),
    description: "Curso online",
    creditCardId: "1",
    notes: "Curso de programação",
    installments: 3,
    currentInstallment: 1,
    userId: "3",
  },
];

// Metas
export const mockGoals: Goal[] = [
  {
    id: "1",
    name: "Viagem de férias",
    targetAmount: 5000,
    currentAmount: 2500,
    deadline: new Date(currentDate.getFullYear(), currentDate.getMonth() + 6, 1).toISOString(),
    color: "#3B82F6",
    icon: "plane",
  },
  {
    id: "2",
    name: "Novo notebook",
    targetAmount: 4000,
    currentAmount: 1200,
    deadline: new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 1).toISOString(),
    color: "#8B5CF6",
    icon: "laptop",
  },
  {
    id: "3",
    name: "Fundo de emergência",
    targetAmount: 20000,
    currentAmount: 8500,
    deadline: new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1).toISOString(),
    color: "#10B981",
    icon: "shield",
  },
];
