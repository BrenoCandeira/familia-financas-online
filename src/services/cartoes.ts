import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

interface CartaoData {
  nome: string;
  bandeira: string;
  limite: number;
  fechamento: number;
  vencimento: number;
  status: string;
}

export const addCartao = async (cartaoData: CartaoData) => {
  try {
    const cartoesRef = collection(db, "cartoes");
    await addDoc(cartoesRef, cartaoData);
  } catch (error) {
    console.error("Erro ao adicionar cartão:", error);
    throw error;
  }
}; 