import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFinance } from "../contexts/FinanceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { parseCurrency } from "../utils/formatters";

const EditTransaction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transactions, updateTransaction, fetchData } = useFinance();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [parcelas, setParcelas] = useState<any[]>([]);

  useEffect(() => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      setForm({ ...transaction, amount: transaction.amount.toString().replace('.', ',') });
      // Se for parcelada, buscar todas as parcelas vinculadas
      if (transaction.installments && transaction.installments > 1) {
        const all = transactions.filter(t => t.description === transaction.description && t.installments === transaction.installments);
        setParcelas(all);
      }
    }
  }, [id, transactions]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Atualizar todas as parcelas se for parcelada
      if (parcelas.length > 1) {
        for (const p of parcelas) {
          await updateTransaction({ ...p, ...form, amount: parseCurrency(form.amount) });
        }
      } else {
        await updateTransaction({ ...form, amount: parseCurrency(form.amount) });
      }
      await fetchData();
      toast.success("Transação atualizada com sucesso!");
      navigate("/transactions");
    } catch (error) {
      toast.error("Erro ao atualizar transação");
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <div>Carregando...</div>;

  return (
    <div className="max-w-xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Editar Transação</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Descrição</Label>
          <Input name="description" value={form.description} onChange={handleChange} />
        </div>
        <div>
          <Label>Valor</Label>
          <Input name="amount" value={form.amount} onChange={handleChange} />
        </div>
        <div>
          <Label>Observações</Label>
          <Textarea name="notes" value={form.notes || ""} onChange={handleChange} />
        </div>
        <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar alterações"}</Button>
      </form>
    </div>
  );
};

export default EditTransaction; 