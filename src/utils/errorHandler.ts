import { toast } from "react-hot-toast";

// Tipos de erro
export enum ErrorType {
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  VALIDATION = "VALIDATION",
  NETWORK = "NETWORK",
  DATABASE = "DATABASE",
  UNKNOWN = "UNKNOWN"
}

// Interface para erros da aplicação
export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  code?: string;
  timestamp?: string;
}

// Mensagens de erro padrão
const ERROR_MESSAGES = {
  [ErrorType.AUTHENTICATION]: {
    title: "Erro de Autenticação",
    default: "Não foi possível autenticar. Por favor, tente novamente."
  },
  [ErrorType.AUTHORIZATION]: {
    title: "Erro de Autorização",
    default: "Você não tem permissão para realizar esta ação."
  },
  [ErrorType.VALIDATION]: {
    title: "Erro de Validação",
    default: "Por favor, verifique os dados informados."
  },
  [ErrorType.NETWORK]: {
    title: "Erro de Conexão",
    default: "Não foi possível conectar ao servidor. Verifique sua conexão."
  },
  [ErrorType.DATABASE]: {
    title: "Erro no Banco de Dados",
    default: "Ocorreu um erro ao acessar os dados."
  },
  [ErrorType.UNKNOWN]: {
    title: "Erro Inesperado",
    default: "Ocorreu um erro inesperado. Por favor, tente novamente."
  }
};

/**
 * Classe para tratamento centralizado de erros
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];

  private constructor() {}

  /**
   * Obtém a instância única do ErrorHandler
   */
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Identifica o tipo de erro com base no erro recebido
   */
  private identifyErrorType(error: any): ErrorType {
    if (error?.code === "PGRST301") return ErrorType.AUTHENTICATION;
    if (error?.code === "PGRST302") return ErrorType.AUTHORIZATION;
    if (error?.code?.startsWith("22")) return ErrorType.VALIDATION;
    if (error?.code === "ECONNREFUSED") return ErrorType.NETWORK;
    if (error?.code?.startsWith("23")) return ErrorType.DATABASE;
    return ErrorType.UNKNOWN;
  }

  /**
   * Registra um erro no log
   */
  private logError(error: AppError): void {
    this.errorLog.push({
      ...error,
      timestamp: new Date().toISOString()
    });

    // Em produção, você pode enviar o erro para um serviço de logging
    if (process.env.NODE_ENV === "production") {
      console.error("Erro registrado:", error);
      // Aqui você pode implementar o envio para um serviço como Sentry, LogRocket, etc.
    }
  }

  /**
   * Trata um erro e exibe uma mensagem apropriada
   */
  public handleError(error: any, customMessage?: string): void {
    const errorType = this.identifyErrorType(error);
    const errorInfo = ERROR_MESSAGES[errorType];
    
    const appError: AppError = {
      type: errorType,
      message: customMessage || errorInfo.default,
      details: error?.message,
      code: error?.code
    };

    // Registra o erro
    this.logError(appError);

    // Exibe a mensagem para o usuário
    toast.error(`${errorInfo.title}: ${appError.message}`);
  }

  /**
   * Obtém o histórico de erros
   */
  public getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  /**
   * Limpa o histórico de erros
   */
  public clearErrorLog(): void {
    this.errorLog = [];
  }
}

// Exporta uma instância única do ErrorHandler
export const errorHandler = ErrorHandler.getInstance(); 