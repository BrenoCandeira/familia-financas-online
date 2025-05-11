import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

interface ContaData {
  nome: string;
  tipo: string;
  saldo: number;
  instituicao: string | null;
  status: string;
}

export const addConta = async (contaData: ContaData) => {
  try {
    const contasRef = collection(db, "contas");
    await addDoc(contasRef, contaData);
  } catch (error) {
    console.error("Erro ao adicionar conta:", error);
    throw error;
  }
}; 