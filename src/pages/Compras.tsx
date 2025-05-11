import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { addCompra } from "@/services/compras";

const Compras = () => {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [categoria, setCategoria] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [parcelas, setParcelas] = useState("");

  const resetForm = () => {
    setDescricao("");
    setValor("");
    setData("");
    setCategoria("");
    setFormaPagamento("");
    setParcelas("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!descricao || !valor || !data || !categoria || !formaPagamento) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (formaPagamento === "parcelado" && (!parcelas || Number(parcelas) < 1)) {
      toast.error("Informe o número de parcelas");
      return;
    }

    try {
      const compraData = {
        descricao,
        valor: Number(valor),
        data: new Date(data).toISOString(),
        categoria,
        formaPagamento,
        parcelas: formaPagamento === "parcelado" ? Number(parcelas) : 1,
        status: "pendente"
      };

      await addCompra(compraData);
      toast.success("Compra adicionada com sucesso!");
      resetForm();
    } catch (error) {
      console.error("Erro ao adicionar compra:", error);
      toast.error("Erro ao adicionar compra");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Compras</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <Label htmlFor="descricao">Descrição</Label>
          <Input
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Compras do mês"
            required
          />
        </div>

        <div>
          <Label htmlFor="valor">Valor</Label>
          <CurrencyInput
            id="valor"
            value={Number(valor)}
            onChange={(newValue) => setValor(newValue.toString())}
            placeholder="0,00"
            required
            showPreview={formaPagamento === "parcelado" && Number(parcelas) > 0}
            previewLabel="Valor da parcela"
            previewValue={formaPagamento === "parcelado" && Number(parcelas) > 0 ? Number(valor) / Number(parcelas) : undefined}
          />
        </div>

        <div>
          <Label htmlFor="data">Data</Label>
          <Input
            id="data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alimentacao">Alimentação</SelectItem>
              <SelectItem value="transporte">Transporte</SelectItem>
              <SelectItem value="moradia">Moradia</SelectItem>
              <SelectItem value="saude">Saúde</SelectItem>
              <SelectItem value="educacao">Educação</SelectItem>
              <SelectItem value="lazer">Lazer</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
          <Select value={formaPagamento} onValueChange={setFormaPagamento}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a forma de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a_vista">À Vista</SelectItem>
              <SelectItem value="parcelado">Parcelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formaPagamento === "parcelado" && (
          <div>
            <Label htmlFor="parcelas">Número de Parcelas</Label>
            <Input
              id="parcelas"
              type="number"
              min="1"
              value={parcelas}
              onChange={(e) => setParcelas(e.target.value)}
              required
            />
          </div>
        )}

        <Button type="submit" className="w-full">
          Adicionar Compra
        </Button>
      </form>

      {/* ... rest of the component ... */}
    </div>
  );
};

export default Compras; 