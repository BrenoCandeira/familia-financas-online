import { useState } from "react";
import { useFinance } from "../contexts/FinanceContext";
import { CreditCard as CreditCardType } from "../types/finance";
import { formatCurrency } from "../utils/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, CreditCard as CreditCardIcon } from "lucide-react";

const CARD_COLORS = [
  { color: "#8B5CF6", name: "Roxo" },
  { color: "#EC4899", name: "Rosa" },
  { color: "#EF4444", name: "Vermelho" },
  { color: "#F59E0B", name: "Amarelo" },
  { color: "#10B981", name: "Verde" },
  { color: "#3B82F6", name: "Azul" },
  { color: "#6B7280", name: "Cinza" },
];

const CreditCards = () => {
  const { creditCards, addCreditCard, updateCreditCard, deleteCreditCard } = useFinance();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [newCard, setNewCard] = useState<Omit<CreditCardType, "id">>({
    name: "",
    limit: 0,
    dueDate: "10",
    closeDate: "3",
    color: "#8B5CF6",
    icon: "credit-card",
  });
  
  const [editingCard, setEditingCard] = useState<CreditCardType | null>(null);
  const [cardToDelete, setCardToDelete] = useState<CreditCardType | null>(null);

  const handleAddCard = () => {
    addCreditCard(newCard);
    setNewCard({
      name: "",
      limit: 0,
      dueDate: "10",
      closeDate: "3",
      color: "#8B5CF6",
      icon: "credit-card",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditCard = () => {
    if (editingCard) {
      updateCreditCard(editingCard);
      setEditingCard(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteCard = () => {
    if (cardToDelete) {
      deleteCreditCard(cardToDelete.id);
      setCardToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const openEditDialog = (card: CreditCardType) => {
    setEditingCard({ ...card });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (card: CreditCardType) => {
    setCardToDelete(card);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Cartões de Crédito</h1>
          <p className="text-muted-foreground">
            Gerencie seus cartões de crédito
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo cartão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar cartão de crédito</DialogTitle>
              <DialogDescription>
                Cadastre um novo cartão de crédito para controlar seus gastos.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do cartão</Label>
                <Input
                  id="name"
                  placeholder="Ex: Nubank, Itaú, Bradesco"
                  value={newCard.name}
                  onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="limit">Limite</Label>
                <Input
                  id="limit"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newCard.limit}
                  onChange={(e) => setNewCard({ ...newCard, limit: parseFloat(e.target.value) || 0 })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="closeDate">Dia de fechamento</Label>
                  <Input
                    id="closeDate"
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Dia"
                    value={newCard.closeDate}
                    onChange={(e) => setNewCard({ ...newCard, closeDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Dia de vencimento</Label>
                  <Input
                    id="dueDate"
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Dia"
                    value={newCard.dueDate}
                    onChange={(e) => setNewCard({ ...newCard, dueDate: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {CARD_COLORS.map((colorOption) => (
                    <button
                      key={colorOption.color}
                      type="button"
                      className={`w-8 h-8 rounded-full ${
                        newCard.color === colorOption.color ? "ring-2 ring-primary ring-offset-2" : ""
                      }`}
                      style={{ backgroundColor: colorOption.color }}
                      onClick={() => setNewCard({ ...newCard, color: colorOption.color })}
                      title={colorOption.name}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleAddCard}
                disabled={!newCard.name || newCard.limit <= 0}
              >
                Adicionar cartão
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {creditCards.map((card) => (
          <Card key={card.id} className="overflow-hidden">
            <div
              className="h-2"
              style={{ backgroundColor: card.color || "#8B5CF6" }}
            />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCardIcon className="h-5 w-5" style={{ color: card.color }} />
                  <CardTitle className="text-xl">{card.name}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(card)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(card)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Limite:</span>
                  <span className="font-medium">{formatCurrency(card.limit)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Fechamento:</span>
                  <span>Dia {card.closeDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Vencimento:</span>
                  <span>Dia {card.dueDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Card Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar cartão de crédito</DialogTitle>
            <DialogDescription>
              Atualize as informações do seu cartão
            </DialogDescription>
          </DialogHeader>
          {editingCard && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome do cartão</Label>
                <Input
                  id="edit-name"
                  value={editingCard.name}
                  onChange={(e) =>
                    setEditingCard({ ...editingCard, name: e.target.value })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-limit">Limite</Label>
                <Input
                  id="edit-limit"
                  type="number"
                  step="0.01"
                  value={editingCard.limit}
                  onChange={(e) =>
                    setEditingCard({
                      ...editingCard,
                      limit: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-closeDate">Dia de fechamento</Label>
                  <Input
                    id="edit-closeDate"
                    type="number"
                    min="1"
                    max="31"
                    value={editingCard.closeDate}
                    onChange={(e) =>
                      setEditingCard({
                        ...editingCard,
                        closeDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dueDate">Dia de vencimento</Label>
                  <Input
                    id="edit-dueDate"
                    type="number"
                    min="1"
                    max="31"
                    value={editingCard.dueDate}
                    onChange={(e) =>
                      setEditingCard({
                        ...editingCard,
                        dueDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {CARD_COLORS.map((colorOption) => (
                    <button
                      key={colorOption.color}
                      type="button"
                      className={`w-8 h-8 rounded-full ${
                        editingCard.color === colorOption.color
                          ? "ring-2 ring-primary ring-offset-2"
                          : ""
                      }`}
                      style={{ backgroundColor: colorOption.color }}
                      onClick={() =>
                        setEditingCard({
                          ...editingCard,
                          color: colorOption.color,
                        })
                      }
                      title={colorOption.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditCard}>Salvar alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Card Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir cartão de crédito</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este cartão? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {cardToDelete && (
              <p>
                Cartão: <strong>{cardToDelete.name}</strong>
                <br />
                Limite: <strong>{formatCurrency(cardToDelete.limit)}</strong>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteCard}>
              Excluir cartão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreditCards;
