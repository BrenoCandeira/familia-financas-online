import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { addCartao } from "@/services/cartoes";

const Cartoes = () => {
  const [nome, setNome] = useState("");
  const [bandeira, setBandeira] = useState("");
  const [limite, setLimite] = useState("");
  const [fechamento, setFechamento] = useState("");
  const [vencimento, setVencimento] = useState("");

  const resetForm = () => {
    setNome("");
    setBandeira("");
    setLimite("");
    setFechamento("");
    setVencimento("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !bandeira || !limite || !fechamento || !vencimento) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const cartaoData = {
        nome,
        bandeira,
        limite: Number(limite),
        fechamento: Number(fechamento),
        vencimento: Number(vencimento),
        status: "ativo"
      };

      await addCartao(cartaoData);
      toast.success("Cartão adicionado com sucesso!");
      resetForm();
    } catch (error) {
      console.error("Erro ao adicionar cartão:", error);
      toast.error("Erro ao adicionar cartão");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Cartões</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <Label htmlFor="nome">Nome do Cartão</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Cartão Principal"
            required
          />
        </div>

        <div>
          <Label htmlFor="bandeira">Bandeira</Label>
          <Select value={bandeira} onValueChange={setBandeira}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a bandeira" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visa">Visa</SelectItem>
              <SelectItem value="mastercard">Mastercard</SelectItem>
              <SelectItem value="amex">American Express</SelectItem>
              <SelectItem value="elo">Elo</SelectItem>
              <SelectItem value="hipercard">Hipercard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="limite">Limite</Label>
          <CurrencyInput
            id="limite"
            value={Number(limite)}
            onChange={(newValue) => setLimite(newValue.toString())}
            placeholder="0,00"
            required
          />
        </div>

        <div>
          <Label htmlFor="fechamento">Dia de Fechamento</Label>
          <Input
            id="fechamento"
            type="number"
            min="1"
            max="31"
            value={fechamento}
            onChange={(e) => setFechamento(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="vencimento">Dia de Vencimento</Label>
          <Input
            id="vencimento"
            type="number"
            min="1"
            max="31"
            value={vencimento}
            onChange={(e) => setVencimento(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full">
          Adicionar Cartão
        </Button>
      </form>
    </div>
  );
};

export default Cartoes; 