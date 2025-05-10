import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { User, UserRole } from "../types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isInitialized) return;
        
        setIsLoading(true);
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            // Buscar perfil do usuário
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (error) throw error;
            
            if (profile) {
              const userData: User = {
                id: session.user.id,
                name: profile.name,
                email: session.user.email || '',
                role: profile.role as UserRole,
                avatarUrl: session.user.user_metadata.avatar_url,
              };
              
              setCurrentUser(userData);
            }
          } catch (error) {
            console.error("Erro ao buscar perfil:", error);
            setCurrentUser(null);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
        
        setIsLoading(false);
      }
    );

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) throw error;
          
          if (profile) {
            const userData: User = {
              id: session.user.id,
              name: profile.name,
              email: session.user.email || '',
              role: profile.role as UserRole,
              avatarUrl: session.user.user_metadata.avatar_url,
            };
            
            setCurrentUser(userData);
          }
        }
      } catch (error) {
        console.error("Erro na inicialização:", error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [isInitialized]);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (isLoading) return false;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error("Email ou senha incorretos!");
        return false;
      }
      
      if (!data.user) {
        toast.error("Usuário não encontrado!");
        return false;
      }
      
      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError || !profile) {
        toast.error("Erro ao carregar perfil do usuário!");
        return false;
      }
      
      const userData: User = {
        id: data.user.id,
        name: profile.name,
        email: data.user.email || '',
        role: profile.role as UserRole,
        avatarUrl: data.user.user_metadata.avatar_url,
      };
      
      setCurrentUser(userData);
      toast.success("Login realizado com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro no login:", error);
      toast.error("Ocorreu um erro ao tentar fazer login.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    if (isLoading) return false;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      if (!data.user) {
        toast.error("Erro ao criar usuário!");
        return false;
      }
      
      // Criar perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            name: name,
            role: 'user',
          }
        ]);
        
      if (profileError) {
        toast.error("Erro ao criar perfil do usuário!");
        return false;
      }
      
      toast.success("Registro realizado com sucesso! Verifique seu email para confirmar sua conta.");
      return true;
    } catch (error) {
      console.error("Erro no registro:", error);
      toast.error("Ocorreu um erro ao tentar se registrar.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    if (isLoading) return false;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      toast.success("Enviamos um link para redefinição de senha no seu email.");
      return true;
    } catch (error) {
      console.error("Erro ao solicitar redefinição de senha:", error);
      toast.error("Ocorreu um erro ao solicitar redefinição de senha.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error("Erro ao fazer logout.");
        return;
      }
      
      setCurrentUser(null);
      toast.info("Você saiu com sucesso!");
    } catch (error) {
      console.error("Erro no logout:", error);
      toast.error("Ocorreu um erro ao tentar sair.");
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    isLoading,
    register,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
