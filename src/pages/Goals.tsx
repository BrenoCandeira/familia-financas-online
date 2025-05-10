
import { useState } from "react";
import { useFinance } from "../contexts/FinanceContext";
import { Goal } from "../types";
import { formatCurrency, calculateProgress } from "../utils/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { Plus, Pencil, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const GOAL_COLORS = [
  { color: "#3B82F6", name: "Azul" },
  { color: "#10B981", name: "Verde" },
  { color: "#F59E0B", name: "Amarelo" },
  { color: "#8B5CF6", name: "Roxo" },
  { color: "#EC4899", name: "Rosa" },
  { color: "#EF4444", name: "Vermelho" },
];

const Goals = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useFinance();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [newGoal, setNewGoal] = useState<Omit<Goal, "id">>({
    name: "",
    targetAmount: 0,
    currentAmount: 0,
    deadline: new Date().toISOString(),
    color: "#3B82F6",
  });
  
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  const handleAddGoal = () => {
    addGoal(newGoal);
    setNewGoal({
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      deadline: new Date().toISOString(),
      color: "#3B82F6",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditGoal = () => {
    if (editingGoal) {
      updateGoal(editingGoal);
      setEditingGoal(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteGoal = () => {
    if (goalToDelete) {
      deleteGoal(goalToDelete.id);
      setGoalToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal({ ...goal });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (goal: Goal) => {
    setGoalToDelete(goal);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Metas Financeiras</h1>
          <p className="text-muted-foreground">
            Gerencie suas metas e acompanhe seu progresso
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar meta</DialogTitle>
              <DialogDescription>
                Crie uma nova meta financeira para alcançar seus objetivos.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da meta</Label>
                <Input
                  id="name"
                  placeholder="Ex: Viagem, Carro novo, etc."
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Valor alvo</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">R$</span>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="pl-10"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentAmount">Valor atual</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">R$</span>
                  <Input
                    id="currentAmount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="pl-10"
                    value={newGoal.currentAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, currentAmount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deadline">Data limite</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="deadline"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(new Date(newGoal.deadline), "PPP", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(newGoal.deadline)}
                      onSelect={(date) => date && setNewGoal({ ...newGoal, deadline: date.toISOString() })}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_COLORS.map((colorOption) => (
                    <button
                      key={colorOption.color}
                      type="button"
                      className={`w-8 h-8 rounded-full ${
                        newGoal.color === colorOption.color ? "ring-2 ring-primary ring-offset-2" : ""
                      }`}
                      style={{ backgroundColor: colorOption.color }}
                      onClick={() => setNewGoal({ ...newGoal, color: colorOption.color })}
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
                onClick={handleAddGoal}
                disabled={!newGoal.name || newGoal.targetAmount <= 0}
              >
                Adicionar meta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
          const remaining = goal.targetAmount - goal.currentAmount;
          const deadlineDate = new Date(goal.deadline);
          const daysRemaining = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <Card key={goal.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center">
                    <span
                      className="h-3 w-3 rounded-full mr-2"
                      style={{ backgroundColor: goal.color || "#3B82F6" }}
                    />
                    {goal.name}
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(goal)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(goal)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="flex items-center">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {format(new Date(goal.deadline), "dd/MM/yyyy")}
                  {daysRemaining > 0 && (
                    <span className="ml-2 text-xs bg-secondary px-1 rounded-sm">
                      {daysRemaining} {daysRemaining === 1 ? "dia" : "dias"} restantes
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progresso:</span>
                    <span className="font-semibold">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="text-center p-2 bg-secondary/50 rounded">
                      <div className="text-xs text-muted-foreground">Atual</div>
                      <div className="font-semibold">{formatCurrency(goal.currentAmount)}</div>
                    </div>
                    <div className="text-center p-2 bg-secondary/50 rounded">
                      <div className="text-xs text-muted-foreground">Alvo</div>
                      <div className="font-semibold">{formatCurrency(goal.targetAmount)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full text-center text-sm text-muted-foreground">
                  Faltam {formatCurrency(remaining)}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-lg font-semibold mb-2">Nenhuma meta cadastrada</h3>
          <p className="text-muted-foreground mb-4">
            Adicione suas metas financeiras para acompanhar seu progresso
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nova meta
          </Button>
        </div>
      )}

      {/* Edit Goal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar meta</DialogTitle>
            <DialogDescription>
              Atualize sua meta financeira
            </DialogDescription>
          </DialogHeader>
          {editingGoal && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome da meta</Label>
                <Input
                  id="edit-name"
                  value={editingGoal.name}
                  onChange={(e) =>
                    setEditingGoal({ ...editingGoal, name: e.target.value })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-targetAmount">Valor alvo</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">R$</span>
                  <Input
                    id="edit-targetAmount"
                    type="number"
                    step="0.01"
                    className="pl-10"
                    value={editingGoal.targetAmount}
                    onChange={(e) =>
                      setEditingGoal({
                        ...editingGoal,
                        targetAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-currentAmount">Valor atual</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">R$</span>
                  <Input
                    id="edit-currentAmount"
                    type="number"
                    step="0.01"
                    className="pl-10"
                    value={editingGoal.currentAmount}
                    onChange={(e) =>
                      setEditingGoal({
                        ...editingGoal,
                        currentAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-deadline">Data limite</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="edit-deadline"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(new Date(editingGoal.deadline), "PPP", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(editingGoal.deadline)}
                      onSelect={(date) =>
                        date &&
                        setEditingGoal({
                          ...editingGoal,
                          deadline: date.toISOString(),
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_COLORS.map((colorOption) => (
                    <button
                      key={colorOption.color}
                      type="button"
                      className={`w-8 h-8 rounded-full ${
                        editingGoal.color === colorOption.color
                          ? "ring-2 ring-primary ring-offset-2"
                          : ""
                      }`}
                      style={{ backgroundColor: colorOption.color }}
                      onClick={() =>
                        setEditingGoal({
                          ...editingGoal,
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
            <Button onClick={handleEditGoal}>Salvar alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Goal Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir meta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {goalToDelete && (
              <p>
                Meta: <strong>{goalToDelete.name}</strong>
                <br />
                Progresso: <strong>
                  {calculateProgress(goalToDelete.currentAmount, goalToDelete.targetAmount).toFixed(0)}%
                </strong>
                <br />
                Valor atual: <strong>{formatCurrency(goalToDelete.currentAmount)}</strong>
                <br />
                Valor alvo: <strong>{formatCurrency(goalToDelete.targetAmount)}</strong>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteGoal}>
              Excluir meta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Goals;
