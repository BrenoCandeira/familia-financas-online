import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

interface CompraData {
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
  formaPagamento: string;
  parcelas: number;
  status: string;
}

export const addCompra = async (compraData: CompraData) => {
  try {
    const comprasRef = collection(db, "compras");
    await addDoc(comprasRef, compraData);
  } catch (error) {
    console.error("Erro ao adicionar compra:", error);
    throw error;
  }
}; 