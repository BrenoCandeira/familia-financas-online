import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from "react";
import {
  Account,
  Category,
  CreditCard,
  Goal,
  Transaction,
  DashboardData
} from "../types/finance";
import { toast } from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

// Constantes para mensagens de erro
const ERROR_MESSAGES = {
  NOT_LOGGED_IN: "Usuário não está logado",
  FETCH_ERROR: "Erro ao buscar dados",
  ADD_ERROR: "Erro ao adicionar",
  UPDATE_ERROR: "Erro ao atualizar",
  DELETE_ERROR: "Erro ao excluir",
  TRANSACTION_LINKED: "Não é possível excluir pois existem transações vinculadas",
  DEFAULT_CATEGORY: "Não é possível excluir categorias padrão"
} as const;

interface FinanceContextType {
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

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  
  const [selectedPeriod, setSelectedPeriod] = useState<"thisMonth" | "lastMonth" | "thisYear" | "custom">("thisMonth");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [filteredUserId, setFilteredUserId] = useState<string | null>(null);
  const [filteredAccountId, setFilteredAccountId] = useState<string | null>(null);
  const [filteredCreditCardId, setFilteredCreditCardId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);

  // Memoização dos dados filtrados
  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return [];
    
    let filtered = [...transactions];
    
    // Filtro por período
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date = new Date(now);
    
    if (selectedPeriod === "thisMonth") {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (selectedPeriod === "lastMonth") {
      periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (selectedPeriod === "thisYear") {
      periodStart = new Date(now.getFullYear(), 0, 1);
    } else if (startDate && endDate) {
      periodStart = startDate;
      periodEnd = endDate;
    } else {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    filtered = filtered.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= periodStart && transactionDate <= periodEnd;
    });
    
    if (filteredUserId) {
      filtered = filtered.filter(t => t.userId === filteredUserId);
    }
    
    if (filteredAccountId) {
      filtered = filtered.filter(t => t.accountId === filteredAccountId);
    }
    
    if (filteredCreditCardId) {
      filtered = filtered.filter(t => t.creditCardId === filteredCreditCardId);
    }
    
    return filtered;
  }, [transactions, selectedPeriod, startDate, endDate, filteredUserId, filteredAccountId, filteredCreditCardId]);

  // Memoização dos dados do dashboard
  const dashboardData = useMemo<DashboardData | null>(() => {
    if (!filteredTransactions.length && !accounts.length) return null;
    
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    
    const accountBalances = accounts.map(account => ({
      accountId: account.id,
      name: account.name,
      balance: account.balance,
      color: account.color,
    }));
    
    const categoryExpensesMap = new Map<string, number>();
    
    filteredTransactions
      .filter(t => t.type === "saída")
      .forEach(transaction => {
        const currentAmount = categoryExpensesMap.get(transaction.categoryId) || 0;
        categoryExpensesMap.set(transaction.categoryId, currentAmount + transaction.amount);
      });
    
    const categoryExpenses = Array.from(categoryExpensesMap.entries()).map(([categoryId, amount]) => {
      const category = categories.find(c => c.id === categoryId);
      return {
        categoryId,
        amount,
        name: category?.name || "Desconhecido",
        color: category?.color || "#888888",
      };
    });
    
    const income = filteredTransactions
      .filter(t => t.type === "entrada")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filteredTransactions
      .filter(t => t.type === "saída")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const recentTransactions = [...filteredTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
    
    return {
      totalBalance,
      accountBalances,
      categoryExpenses,
      incomeVsExpense: { income, expense },
      recentTransactions,
    };
  }, [filteredTransactions, accounts, categories]);

  // Função para buscar dados com tratamento de erro melhorado
  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const [
        { data: accountsData, error: accountsError },
        { data: cardsData, error: cardsError },
        { data: categoriesData, error: categoriesError },
        { data: transactionsData, error: transactionsError },
        { data: goalsData, error: goalsError }
      ] = await Promise.all([
        supabase.from('accounts').select('*').order('name'),
        supabase.from('credit_cards').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('goals').select('*').order('deadline')
      ]);

      if (accountsError) throw new Error(`Erro ao buscar contas: ${accountsError.message}`);
      if (cardsError) throw new Error(`Erro ao buscar cartões: ${cardsError.message}`);
      if (categoriesError) throw new Error(`Erro ao buscar categorias: ${categoriesError.message}`);
      if (transactionsError) throw new Error(`Erro ao buscar transações: ${transactionsError.message}`);
      if (goalsError) throw new Error(`Erro ao buscar metas: ${goalsError.message}`);

      setAccounts(accountsData.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        balance: a.balance,
        color: a.color || undefined,
        icon: a.icon || undefined
      })));

      setCreditCards(cardsData.map(c => ({
        id: c.id,
        name: c.name,
        limit: c.limit_amount,
        dueDate: c.due_date,
        closeDate: c.close_date,
        color: c.color || undefined,
        icon: c.icon || undefined
      })));

      setCategories(categoriesData.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type as "entrada" | "saída" | "ambos",
        color: c.color,
        icon: c.icon || undefined,
        isDefault: c.is_default || false
      })));

      setTransactions(transactionsData.map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.type as "entrada" | "saída",
        categoryId: t.category_id,
        date: t.date,
        description: t.description,
        accountId: t.account_id || undefined,
        creditCardId: t.credit_card_id || undefined,
        notes: t.notes || undefined,
        installments: t.installments || undefined,
        currentInstallment: t.current_installment || undefined,
        userId: t.user_id
      })));

      setGoals(goalsData.map(g => ({
        id: g.id,
        name: g.name,
        targetAmount: g.target_amount,
        currentAmount: g.current_amount || 0,
        deadline: g.deadline,
        color: g.color || undefined,
        icon: g.icon || undefined
      })));

    } catch (error: any) {
      console.error(ERROR_MESSAGES.FETCH_ERROR, error);
      toast.error(`${ERROR_MESSAGES.FETCH_ERROR}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    } else {
      // Limpar os dados quando o usuário deslogar
      setAccounts([]);
      setCreditCards([]);
      setCategories([]);
      setTransactions([]);
      setGoals([]);
    }
  }, [currentUser]);

  // Funções para gerenciar contas
  const addAccount = async (account: Omit<Account, "id">) => {
    try {
      if (!currentUser) throw new Error("Usuário não está logado");
      
      const { data, error } = await supabase
        .from('accounts')
        .insert([{
          name: account.name,
          type: account.type,
          balance: account.balance,
          color: account.color,
          icon: account.icon,
          user_id: currentUser.id  // Adicionar user_id do usuário logado
        }])
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        setAccounts([...accounts, {
          id: data[0].id,
          name: data[0].name,
          type: data[0].type,
          balance: data[0].balance,
          color: data[0].color || undefined,
          icon: data[0].icon || undefined
        }]);
        toast.success("Conta adicionada com sucesso!");
      }
    } catch (error: any) {
      console.error("Erro ao adicionar conta:", error.message);
      toast.error("Ocorreu um erro ao adicionar a conta.");
    }
  };

  const updateAccount = async (account: Account) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .update({
          name: account.name,
          type: account.type,
          balance: account.balance,
          color: account.color,
          icon: account.icon
        })
        .eq('id', account.id);
      
      if (error) throw error;
      
      setAccounts(accounts.map(a => a.id === account.id ? account : a));
      toast.success("Conta atualizada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao atualizar conta:", error.message);
      toast.error("Ocorreu um erro ao atualizar a conta.");
    }
  };

  const deleteAccount = async (accountId: string) => {
    // Verificar se há transações vinculadas à conta
    const hasTransactions = transactions.some(t => t.accountId === accountId);
    
    if (hasTransactions) {
      toast.error("Não é possível excluir uma conta com transações vinculadas.");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId);
      
      if (error) throw error;
      
      setAccounts(accounts.filter(a => a.id !== accountId));
      toast.success("Conta excluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir conta:", error.message);
      toast.error("Ocorreu um erro ao excluir a conta.");
    }
  };

  // Funções para gerenciar cartões de crédito
  const addCreditCard = async (creditCard: Omit<CreditCard, "id">) => {
    try {
      if (!currentUser) throw new Error("Usuário não está logado");
      
      const { data, error } = await supabase
        .from('credit_cards')
        .insert([{
          name: creditCard.name,
          limit_amount: creditCard.limit,
          due_date: creditCard.dueDate,
          close_date: creditCard.closeDate,
          color: creditCard.color,
          icon: creditCard.icon,
          user_id: currentUser.id  // Adicionar user_id do usuário logado
        }])
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        setCreditCards([...creditCards, {
          id: data[0].id,
          name: data[0].name,
          limit: data[0].limit_amount,
          dueDate: data[0].due_date,
          closeDate: data[0].close_date,
          color: data[0].color || undefined,
          icon: data[0].icon || undefined
        }]);
        toast.success("Cartão de crédito adicionado com sucesso!");
      }
    } catch (error: any) {
      console.error("Erro ao adicionar cartão:", error.message);
      toast.error("Ocorreu um erro ao adicionar o cartão de crédito.");
    }
  };

  const updateCreditCard = async (creditCard: CreditCard) => {
    try {
      const { error } = await supabase
        .from('credit_cards')
        .update({
          name: creditCard.name,
          limit_amount: creditCard.limit,
          due_date: creditCard.dueDate,
          close_date: creditCard.closeDate,
          color: creditCard.color,
          icon: creditCard.icon
        })
        .eq('id', creditCard.id);
      
      if (error) throw error;
      
      setCreditCards(creditCards.map(c => c.id === creditCard.id ? creditCard : c));
      toast.success("Cartão de crédito atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao atualizar cartão:", error.message);
      toast.error("Ocorreu um erro ao atualizar o cartão de crédito.");
    }
  };

  const deleteCreditCard = async (creditCardId: string) => {
    // Verificar se há transações vinculadas ao cartão
    const hasTransactions = transactions.some(t => t.creditCardId === creditCardId);
    
    if (hasTransactions) {
      toast.error("Não é possível excluir um cartão com transações vinculadas.");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('credit_cards')
        .delete()
        .eq('id', creditCardId);
      
      if (error) throw error;
      
      setCreditCards(creditCards.filter(c => c.id !== creditCardId));
      toast.success("Cartão de crédito excluído com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir cartão:", error.message);
      toast.error("Ocorreu um erro ao excluir o cartão de crédito.");
    }
  };

  // Funções para gerenciar categorias
  const addCategory = async (category: Omit<Category, "id">) => {
    try {
      if (!currentUser) throw new Error("Usuário não está logado");
      
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: category.name,
          type: category.type,
          color: category.color,
          icon: category.icon,
          is_default: category.isDefault || false,
          created_by: currentUser.id  // Usar created_by para categorias
        }])
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        setCategories([...categories, {
          id: data[0].id,
          name: data[0].name,
          type: data[0].type as "entrada" | "saída" | "ambos",
          color: data[0].color,
          icon: data[0].icon || undefined,
          isDefault: data[0].is_default || false
        }]);
        toast.success("Categoria adicionada com sucesso!");
      }
    } catch (error: any) {
      console.error("Erro ao adicionar categoria:", error.message);
      toast.error("Ocorreu um erro ao adicionar a categoria.");
    }
  };

  const updateCategory = async (category: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          type: category.type,
          color: category.color,
          icon: category.icon,
          is_default: category.isDefault || false
        })
        .eq('id', category.id);
      
      if (error) throw error;
      
      setCategories(categories.map(c => c.id === category.id ? category : c));
      toast.success("Categoria atualizada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao atualizar categoria:", error.message);
      toast.error("Ocorreu um erro ao atualizar a categoria.");
    }
  };

  const deleteCategory = async (categoryId: string) => {
    // Verificar se é uma categoria padrão
    const category = categories.find(c => c.id === categoryId);
    
    if (category?.isDefault) {
      toast.error("Não é possível excluir categorias padrão.");
      return;
    }
    
    // Verificar se há transações vinculadas à categoria
    const hasTransactions = transactions.some(t => t.categoryId === categoryId);
    
    if (hasTransactions) {
      toast.error("Não é possível excluir uma categoria com transações vinculadas.");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
      
      setCategories(categories.filter(c => c.id !== categoryId));
      toast.success("Categoria excluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir categoria:", error.message);
      toast.error("Ocorreu um erro ao excluir a categoria.");
    }
  };

  // Funções para gerenciar transações
  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      if (!currentUser) throw new Error("Usuário não está logado");
      
      // Se tem parcelas, cria múltiplas transações
      if (transaction.installments && transaction.installments > 1) {
        const installments = transaction.installments;
        const baseDate = new Date(transaction.date);
        
        // Preparar array de transações a inserir
        const transactionsToInsert: Array<{
          amount: number;
          type: "entrada" | "saída";
          category_id: string;
          date: string;
          description: string;
          account_id: string | undefined;
          credit_card_id: string | undefined;
          notes: string | undefined;
          installments: number;
          current_installment: number;
          user_id: string;
        }> = [];
        
        // Criar transação pai
        const parentTransaction = {
          amount: transaction.amount,
          type: transaction.type,
          category_id: transaction.categoryId,
          date: transaction.date,
          description: transaction.description,
          account_id: transaction.accountId,
          credit_card_id: transaction.creditCardId,
          notes: transaction.notes,
          installments: installments,
          current_installment: 1, // Primeira parcela
          user_id: currentUser.id // Adicionar user_id do usuário logado
        };
        
        transactionsToInsert.push(parentTransaction);
        
        // Inserir transação pai para obter o ID
        const { data: parentData, error: parentError } = await supabase
          .from('transactions')
          .insert([parentTransaction])
          .select();
        
        if (parentError) throw parentError;
        
        if (parentData && parentData[0]) {
          const parentId = parentData[0].id;
          
          // Criar parcelas adicionais (a partir da segunda)
          const childTransactions: Array<{
            amount: number;
            type: "entrada" | "saída";
            category_id: string;
            date: string;
            description: string;
            account_id: string | undefined;
            credit_card_id: string | undefined;
            notes: string | undefined;
            installments: number;
            current_installment: number;
            parent_transaction_id: string;
            user_id: string;
          }> = [];
          for (let i = 2; i <= installments; i++) {
            // Adicionar um mês à data para cada parcela
            const installmentDate = new Date(baseDate);
            installmentDate.setMonth(baseDate.getMonth() + (i - 1));
            
            childTransactions.push({
              amount: transaction.amount,
              type: transaction.type,
              category_id: transaction.categoryId,
              date: installmentDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
              description: `${transaction.description} (${i}/${installments})`,
              account_id: transaction.accountId,
              credit_card_id: transaction.creditCardId,
              notes: transaction.notes,
              installments: installments,
              current_installment: i,
              parent_transaction_id: parentId,
              user_id: currentUser.id // Adicionar user_id do usuário logado
            });
          }
          
          // Inserir transações filhas
          if (childTransactions.length > 0) {
            const { error: childError } = await supabase
              .from('transactions')
              .insert(childTransactions);
            
            if (childError) throw childError;
          }
        }
        
      } else {
        // Transação única
        const { error } = await supabase
          .from('transactions')
          .insert([{
            amount: transaction.amount,
            type: transaction.type,
            category_id: transaction.categoryId,
            date: transaction.date,
            description: transaction.description,
            account_id: transaction.accountId,
            credit_card_id: transaction.creditCardId,
            notes: transaction.notes,
            installments: transaction.installments || null,
            current_installment: transaction.currentInstallment || null,
            user_id: currentUser.id // Adicionar user_id do usuário logado
          }]);
        
        if (error) throw error;
      }
      
      // Atualizar o saldo da conta se a transação estiver vinculada a uma conta
      if (transaction.accountId) {
        const account = accounts.find(a => a.id === transaction.accountId);
        
        if (account) {
          const balanceChange = transaction.type === "entrada" ? transaction.amount : -transaction.amount;
          const updatedAccount = {
            ...account,
            balance: account.balance + balanceChange
          };
          
          await updateAccount(updatedAccount);
        }
      }
      
      // Recarregar as transações
      await fetchData();
      toast.success("Transação adicionada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao adicionar transação:", error.message);
      toast.error("Ocorreu um erro ao adicionar a transação.");
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    try {
      // Encontrar a transação original
      const originalTransaction = transactions.find(t => t.id === transaction.id);
      
      if (originalTransaction && originalTransaction.accountId) {
        // Reverter a transação original na conta
        const account = accounts.find(a => a.id === originalTransaction.accountId);
        
        if (account) {
          const reverseChange = originalTransaction.type === "entrada" ? -originalTransaction.amount : originalTransaction.amount;
          const updatedAccount = {
            ...account,
            balance: account.balance + reverseChange
          };
          
          await updateAccount(updatedAccount);
        }
      }
      
      // Atualizar a transação
      const { error } = await supabase
        .from('transactions')
        .update({
          amount: transaction.amount,
          type: transaction.type,
          category_id: transaction.categoryId,
          date: transaction.date,
          description: transaction.description,
          account_id: transaction.accountId,
          credit_card_id: transaction.creditCardId,
          notes: transaction.notes,
          installments: transaction.installments,
          current_installment: transaction.currentInstallment
        })
        .eq('id', transaction.id);
      
      if (error) throw error;
      
      // Aplicar a nova transação na conta, se aplicável
      if (transaction.accountId) {
        const account = accounts.find(a => a.id === transaction.accountId);
        
        if (account) {
          const balanceChange = transaction.type === "entrada" ? transaction.amount : -transaction.amount;
          const updatedAccount = {
            ...account,
            balance: account.balance + balanceChange
          };
          
          await updateAccount(updatedAccount);
        }
      }
      
      // Recarregar as transações
      await fetchData();
      toast.success("Transação atualizada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao atualizar transação:", error.message);
      toast.error("Ocorreu um erro ao atualizar a transação.");
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    try {
      const transaction = transactions.find(t => t.id === transactionId);
      
      if (transaction && transaction.accountId) {
        // Reverter o efeito da transação na conta
        const account = accounts.find(a => a.id === transaction.accountId);
        
        if (account) {
          const reverseChange = transaction.type === "entrada" ? -transaction.amount : transaction.amount;
          const updatedAccount = {
            ...account,
            balance: account.balance + reverseChange
          };
          
          await updateAccount(updatedAccount);
        }
      }
      
      // Excluir a transação
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);
      
      if (error) throw error;
      
      // Recarregar as transações
      await fetchData();
      toast.success("Transação excluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir transação:", error.message);
      toast.error("Ocorreu um erro ao excluir a transação.");
    }
  };

  // Funções para gerenciar metas
  const addGoal = async (goal: Omit<Goal, "id">) => {
    try {
      if (!currentUser) throw new Error("Usuário não está logado");
      
      const { data, error } = await supabase
        .from('goals')
        .insert([{
          name: goal.name,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount || 0,
          deadline: goal.deadline,
          color: goal.color,
          icon: goal.icon,
          user_id: currentUser.id  // Adicionar user_id do usuário logado
        }])
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        setGoals([...goals, {
          id: data[0].id,
          name: data[0].name,
          targetAmount: data[0].target_amount,
          currentAmount: data[0].current_amount || 0,
          deadline: data[0].deadline,
          color: data[0].color || undefined,
          icon: data[0].icon || undefined
        }]);
        toast.success("Meta adicionada com sucesso!");
      }
    } catch (error: any) {
      console.error("Erro ao adicionar meta:", error.message);
      toast.error("Ocorreu um erro ao adicionar a meta.");
    }
  };

  const updateGoal = async (goal: Goal) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({
          name: goal.name,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount,
          deadline: goal.deadline,
          color: goal.color,
          icon: goal.icon
        })
        .eq('id', goal.id);
      
      if (error) throw error;
      
      setGoals(goals.map(g => g.id === goal.id ? goal : g));
      toast.success("Meta atualizada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao atualizar meta:", error.message);
      toast.error("Ocorreu um erro ao atualizar a meta.");
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);
      
      if (error) throw error;
      
      setGoals(goals.filter(g => g.id !== goalId));
      toast.success("Meta excluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir meta:", error.message);
      toast.error("Ocorreu um erro ao excluir a meta.");
    }
  };

  const setDateRange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        creditCards,
        categories,
        transactions,
        goals,
        selectedPeriod,
        startDate,
        endDate,
        filteredUserId,
        filteredAccountId,
        filteredCreditCardId,
        dashboardData,
        isLoading,
        
        addAccount,
        updateAccount,
        deleteAccount,
        
        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
        
        addCategory,
        updateCategory,
        deleteCategory,
        
        addTransaction,
        updateTransaction,
        deleteTransaction,
        
        addGoal,
        updateGoal,
        deleteGoal,
        
        setSelectedPeriod,
        setDateRange,
        setFilteredUserId,
        setFilteredAccountId,
        setFilteredCreditCardId,
        
        fetchData
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance deve ser usado dentro de um FinanceProvider");
  }
  return context;
};
