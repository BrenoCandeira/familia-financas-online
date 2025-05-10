import { useState } from "react";
import { useFinance } from "../contexts/FinanceContext";
import { Category } from "../types/finance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";

const CATEGORY_COLORS = [
  { color: "#3B82F6", name: "Azul" },
  { color: "#10B981", name: "Verde" },
  { color: "#F59E0B", name: "Amarelo" },
  { color: "#8B5CF6", name: "Roxo" },
  { color: "#EC4899", name: "Rosa" },
  { color: "#EF4444", name: "Vermelho" },
  { color: "#6B7280", name: "Cinza" },
];

const Categories = () => {
  const { categories, addCategory, updateCategory, deleteCategory, isLoading } = useFinance();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"todas" | "entrada" | "saída" | "ambos">("todas");
  
  const [newCategory, setNewCategory] = useState<Omit<Category, "id">>({
    name: "",
    type: "saída",
    color: "#3B82F6",
    icon: "tag",
  });
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const handleAddCategory = () => {
    addCategory(newCategory);
    setNewCategory({
      name: "",
      type: "saída",
      color: "#3B82F6",
      icon: "tag",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditCategory = () => {
    if (editingCategory) {
      updateCategory(editingCategory);
      setEditingCategory(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory({ ...category });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const filteredCategories = categories.filter(category => {
    if (activeTab === "todas") return true;
    return category.type === activeTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">
            Gerencie suas categorias de lançamentos
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar categoria</DialogTitle>
              <DialogDescription>
                Crie uma nova categoria para seus lançamentos financeiros.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da categoria</Label>
                <Input
                  id="name"
                  placeholder="Ex: Alimentação, Transporte, Salário"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de categoria</Label>
                <Select
                  value={newCategory.type}
                  onValueChange={(value: "entrada" | "saída" | "ambos") => 
                    setNewCategory({ ...newCategory, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saída">Saída</SelectItem>
                    <SelectItem value="ambos">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((colorOption) => (
                    <button
                      key={colorOption.color}
                      type="button"
                      className={`w-8 h-8 rounded-full ${
                        newCategory.color === colorOption.color ? "ring-2 ring-primary ring-offset-2" : ""
                      }`}
                      style={{ backgroundColor: colorOption.color }}
                      onClick={() => setNewCategory({ ...newCategory, color: colorOption.color })}
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
                onClick={handleAddCategory}
                disabled={!newCategory.name}
              >
                Adicionar categoria
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="todas" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid grid-cols-4 w-full md:w-[400px]">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="entrada">Entradas</TabsTrigger>
          <TabsTrigger value="saída">Saídas</TabsTrigger>
          <TabsTrigger value="ambos">Ambos</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          {isLoading ? (
            <Card className="p-8 text-center">
              <p>Carregando categorias...</p>
            </Card>
          ) : filteredCategories.length === 0 ? (
            <Card className="p-8 text-center">
              <p>Nenhuma categoria encontrada.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <Card key={category.id} className="overflow-hidden">
                  <div
                    className="h-2"
                    style={{ backgroundColor: category.color }}
                  />
                  <CardHeader className="flex flex-row items-center justify-between py-4">
                    <CardTitle className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </CardTitle>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(category)}
                        disabled={category.isDefault}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(category)}
                        disabled={category.isDefault}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {category.type === "entrada" 
                            ? "Entrada" 
                            : category.type === "saída" 
                              ? "Saída" 
                              : "Ambos"}
                        </span>
                      </div>
                      {category.isDefault && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                          Padrão
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Tabs>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar categoria</DialogTitle>
            <DialogDescription>
              Atualize as informações da categoria
            </DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome da categoria</Label>
                <Input
                  id="edit-name"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo de categoria</Label>
                <Select
                  value={editingCategory.type}
                  onValueChange={(value: "entrada" | "saída" | "ambos") =>
                    setEditingCategory({ ...editingCategory, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saída">Saída</SelectItem>
                    <SelectItem value="ambos">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((colorOption) => (
                    <button
                      key={colorOption.color}
                      type="button"
                      className={`w-8 h-8 rounded-full ${
                        editingCategory.color === colorOption.color
                          ? "ring-2 ring-primary ring-offset-2"
                          : ""
                      }`}
                      style={{ backgroundColor: colorOption.color }}
                      onClick={() =>
                        setEditingCategory({
                          ...editingCategory,
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
            <Button onClick={handleEditCategory}>Salvar alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir categoria</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {categoryToDelete && (
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: categoryToDelete.color }}
                />
                <p>
                  <strong>{categoryToDelete.name}</strong> ({categoryToDelete.type})
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Excluir categoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
