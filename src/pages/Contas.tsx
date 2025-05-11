import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { addConta } from "@/services/contas";

const Contas = () => {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [saldo, setSaldo] = useState("");
  const [instituicao, setInstituicao] = useState("");

  const resetForm = () => {
    setNome("");
    setTipo("");
    setSaldo("");
    setInstituicao("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !tipo || !saldo) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const contaData = {
        nome,
        tipo,
        saldo: Number(saldo),
        instituicao: instituicao || null,
        status: "ativa"
      };

      await addConta(contaData);
      toast.success("Conta adicionada com sucesso!");
      resetForm();
    } catch (error) {
      console.error("Erro ao adicionar conta:", error);
      toast.error("Erro ao adicionar conta");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Contas</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <Label htmlFor="nome">Nome da Conta</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Conta Principal"
            required
          />
        </div>

        <div>
          <Label htmlFor="tipo">Tipo de Conta</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="corrente">Conta Corrente</SelectItem>
              <SelectItem value="poupanca">Conta Poupança</SelectItem>
              <SelectItem value="investimento">Conta Investimento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="saldo">Saldo Inicial</Label>
          <CurrencyInput
            id="saldo"
            value={Number(saldo)}
            onChange={(newValue) => setSaldo(newValue.toString())}
            placeholder="0,00"
            required
          />
        </div>

        <div>
          <Label htmlFor="instituicao">Instituição Financeira</Label>
          <Input
            id="instituicao"
            value={instituicao}
            onChange={(e) => setInstituicao(e.target.value)}
            placeholder="Ex: Banco do Brasil"
          />
        </div>

        <Button type="submit" className="w-full">
          Adicionar Conta
        </Button>
      </form>
    </div>
  );
};

export default Contas; 