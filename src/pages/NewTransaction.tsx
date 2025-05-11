import { useState, useEffect } from "react";
import { useFinance } from "../contexts/FinanceContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon, CreditCard, Wallet, DollarSign } from "lucide-react";
import { toast } from "react-hot-toast";
import { parseCurrency, formatCurrencyInput } from "../utils/formatters";

// Interface para validação
interface ValidationErrors {
  amount?: string;
  description?: string;
  categoryId?: string;
  accountId?: string;
  creditCardId?: string;
  installments?: string;
  notes?: string;
}

const NewTransaction = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    categories, 
    accounts, 
    creditCards,
    addTransaction,
    isLoading 
  } = useFinance();
  
  const [type, setType] = useState<"entrada" | "saída">("saída");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<"account" | "creditCard">("account");
  const [accountId, setAccountId] = useState("");
  const [creditCardId, setCreditCardId] = useState("");
  const [notes, setNotes] = useState("");
  const [installments, setInstallments] = useState("1");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isTotalAmount, setIsTotalAmount] = useState(true);
  
  // Filtrar categorias com base no tipo de transação
  const filteredCategories = categories.filter(
    category => category.type === type || category.type === "ambos"
  );

  // Resetar categoria ao mudar o tipo
  useEffect(() => {
    setCategoryId("");
    setErrors({});
  }, [type]);

  // Validação do valor monetário
  const validateAmount = (value: string): boolean => {
    const parsedAmount = parseCurrency(value);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrors(prev => ({ ...prev, amount: "Valor deve ser maior que zero" }));
      return false;
    }
    if (parsedAmount > 999999999.99) {
      setErrors(prev => ({ ...prev, amount: "Valor máximo permitido é R$ 999.999.999,99" }));
      return false;
    }
    setErrors(prev => ({ ...prev, amount: undefined }));
    return true;
  };

  // Validação da descrição
  const validateDescription = (value: string): boolean => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, description: "Descrição é obrigatória" }));
      return false;
    }
    if (value.length > 100) {
      setErrors(prev => ({ ...prev, description: "Descrição deve ter no máximo 100 caracteres" }));
      return false;
    }
    setErrors(prev => ({ ...prev, description: undefined }));
    return true;
  };

  // Validação da categoria
  const validateCategory = (value: string): boolean => {
    if (!value) {
      setErrors(prev => ({ ...prev, categoryId: "Selecione uma categoria" }));
      return false;
    }
    setErrors(prev => ({ ...prev, categoryId: undefined }));
    return true;
  };

  // Validação do método de pagamento
  const validatePaymentMethod = (): boolean => {
    if (paymentMethod === "account" && !accountId) {
      setErrors(prev => ({ ...prev, accountId: "Selecione uma conta" }));
      return false;
    }
    if (paymentMethod === "creditCard" && !creditCardId) {
      setErrors(prev => ({ ...prev, creditCardId: "Selecione um cartão de crédito" }));
      return false;
    }
    setErrors(prev => ({ ...prev, accountId: undefined, creditCardId: undefined }));
    return true;
  };

  // Validação das parcelas
  const validateInstallments = (value: string): boolean => {
    const installmentsCount = parseInt(value);
    if (isNaN(installmentsCount) || installmentsCount < 1) {
      setErrors(prev => ({ ...prev, installments: "Número de parcelas inválido" }));
      return false;
    }
    if (installmentsCount > 48) {
      setErrors(prev => ({ ...prev, installments: "Máximo de 48 parcelas" }));
      return false;
    }
    setErrors(prev => ({ ...prev, installments: undefined }));
    return true;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.,]/g, '');
    setAmount(value);
    validateAmount(value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDescription(value);
    validateDescription(value);
  };

  const handleInstallmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value === "0") return;
    setInstallments(value);
    validateInstallments(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todos os campos
    const isAmountValid = validateAmount(amount);
    const isDescriptionValid = validateDescription(description);
    const isCategoryValid = validateCategory(categoryId);
    const isPaymentMethodValid = validatePaymentMethod();
    const isInstallmentsValid = validateInstallments(installments);
    
    if (!isAmountValid || !isDescriptionValid || !isCategoryValid || 
        !isPaymentMethodValid || !isInstallmentsValid) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }
    
    const installmentsCount = parseInt(installments);
    const parsedAmount = parseCurrency(amount);
    
    const transactionData = {
      amount: parsedAmount,
      type,
      categoryId,
      date: new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().split('T')[0],
      description,
      accountId: paymentMethod === "account" ? accountId : undefined,
      creditCardId: paymentMethod === "creditCard" ? creditCardId : undefined,
      notes: notes || undefined,
      installments: installmentsCount > 1 ? installmentsCount : undefined,
      userId: currentUser?.id || ""
    };
    
    try {
      await addTransaction(transactionData);
      navigate("/transactions");
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      toast.error("Ocorreu um erro ao criar a transação.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nova Transação</h1>
        <p className="text-muted-foreground">
          Adicione uma nova entrada ou saída
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da transação</CardTitle>
          <CardDescription>Preencha as informações da sua transação</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Tipo de transação */}
              <div>
                <Label>Tipo de transação</Label>
                <div className="flex mt-1 space-x-2">
                  <Button
                    type="button"
                    variant={type === "entrada" ? "default" : "outline"}
                    className={cn(
                      "flex-1",
                      type === "entrada" ? "bg-financial-income hover:bg-financial-income/90" : ""
                    )}
                    onClick={() => setType("entrada")}
                  >
                    Entrada
                  </Button>
                  <Button
                    type="button"
                    variant={type === "saída" ? "default" : "outline"}
                    className={cn(
                      "flex-1",
                      type === "saída" ? "bg-financial-expense hover:bg-financial-expense/90" : ""
                    )}
                    onClick={() => setType("saída")}
                  >
                    Saída
                  </Button>
                </div>
              </div>
              
              {/* Valor */}
              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">R$</span>
                  <Input
                    id="amount"
                    placeholder="0,00"
                    value={amount}
                    onChange={handleAmountChange}
                    className={`pl-10 ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                )}
              </div>
              
              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Ex: Compra de supermercado"
                  value={description}
                  onChange={handleDescriptionChange}
                  className={`${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
              
              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={categoryId} onValueChange={(value) => setCategoryId(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
                )}
              </div>
              
              {/* Data */}
              <div className="space-y-2">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Método de pagamento */}
              <div className="space-y-2">
                <Label>Método de pagamento</Label>
                <div className="flex mt-1 space-x-2">
                  <Button
                    type="button"
                    variant={paymentMethod === "account" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setPaymentMethod("account")}
                  >
                    <Wallet className="mr-2 h-4 w-4" /> Conta
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === "creditCard" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setPaymentMethod("creditCard")}
                  >
                    <CreditCard className="mr-2 h-4 w-4" /> Cartão de Crédito
                  </Button>
                </div>
              </div>
              
              {/* Conta (se selecionada) */}
              {paymentMethod === "account" && (
                <div className="space-y-2">
                  <Label htmlFor="account">Conta</Label>
                  <Select value={accountId} onValueChange={setAccountId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: account.color || "#888" }}
                            />
                            {account.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Cartão de crédito (se selecionado) */}
              {paymentMethod === "creditCard" && (
                <div className="space-y-2">
                  <Label htmlFor="creditCard">Cartão de crédito</Label>
                  <Select value={creditCardId} onValueChange={setCreditCardId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cartão" />
                    </SelectTrigger>
                    <SelectContent>
                      {creditCards.map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: card.color || "#888" }}
                            />
                            {card.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Parcelas (apenas para cartões) */}
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="installments">Número de parcelas</Label>
                    <Input
                      id="installments"
                      type="text"
                      value={installments}
                      onChange={handleInstallmentsChange}
                      placeholder="1"
                      className={`${errors.installments ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.installments && (
                      <p className="text-red-500 text-sm mt-1">{errors.installments}</p>
                    )}
                    
                    {/* Opção de valor total/parcela */}
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="radio"
                        id="totalAmount"
                        checked={isTotalAmount}
                        onChange={() => setIsTotalAmount(true)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="totalAmount" className="text-sm">Valor total da compra</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="installmentAmount"
                        checked={!isTotalAmount}
                        onChange={() => setIsTotalAmount(false)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="installmentAmount" className="text-sm">Valor da parcela</Label>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas adicionais sobre esta transação"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className={`${errors.notes ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button" 
                variant="outline"
                onClick={() => navigate("/transactions")}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Salvando..." : "Salvar transação"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewTransaction;
