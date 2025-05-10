import { useState } from "react";
import { useFinance } from "../contexts/FinanceContext";
import { Account } from "../types";
import { formatCurrency } from "../utils/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Wallet, PiggyBank } from "lucide-react";

const ACCOUNT_TYPES = [
  { value: "corrente", label: "Conta Corrente", icon: <Wallet className="h-4 w-4" /> },
  { value: "poupança", label: "Poupança", icon: <PiggyBank className="h-4 w-4" /> },
  { value: "investimento", label: "Investimento", icon: <PiggyBank className="h-4 w-4" /> },
  { value: "carteira", label: "Carteira", icon: <Wallet className="h-4 w-4" /> },
];

const ACCOUNT_COLORS = [
  { color: "#3B82F6", name: "Azul" },
  { color: "#10B981", name: "Verde" },
  { color: "#F59E0B", name: "Amarelo" },
  { color: "#8B5CF6", name: "Roxo" },
  { color: "#EC4899", name: "Rosa" },
  { color: "#EF4444", name: "Vermelho" },
  { color: "#6B7280", name: "Cinza" },
];

const Accounts = () => {
  const { accounts, addAccount, updateAccount, deleteAccount } = useFinance();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [newAccount, setNewAccount] = useState<Omit<Account, "id">>({
    name: "",
    type: "corrente",
    balance: 0,
    color: "#3B82F6",
    icon: "wallet",
  });
  
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const handleAddAccount = () => {
    addAccount(newAccount);
    setNewAccount({
      name: "",
      type: "corrente",
      balance: 0,
      color: "#3B82F6",
      icon: "wallet",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditAccount = () => {
    if (editingAccount) {
      updateAccount(editingAccount);
      setEditingAccount(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteAccount = () => {
    if (accountToDelete) {
      deleteAccount(accountToDelete.id);
      setAccountToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const openEditDialog = (account: Account) => {
    setEditingAccount({ ...account });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (account: Account) => {
    setAccountToDelete(account);
    setIsDeleteDialogOpen(true);
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contas</h1>
          <p className="text-muted-foreground">
            Gerencie suas contas e saldos
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova conta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar conta</DialogTitle>
              <DialogDescription>
                Crie uma nova conta para gerenciar seus recursos financeiros.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da conta</Label>
                <Input
                  id="name"
                  placeholder="Ex: Nubank, Caixa, Carteira"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de conta</Label>
                <Select
                  value={newAccount.type}
                  onValueChange={(value) => setNewAccount({ ...newAccount, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center">
                          {type.icon}
                          <span className="ml-2">{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="balance">Saldo inicial</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) || 0 })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {ACCOUNT_COLORS.map((colorOption) => (
                    <button
                      key={colorOption.color}
                      type="button"
                      className={`w-8 h-8 rounded-full ${
                        newAccount.color === colorOption.color ? "ring-2 ring-primary ring-offset-2" : ""
                      }`}
                      style={{ backgroundColor: colorOption.color }}
                      onClick={() => setNewAccount({ ...newAccount, color: colorOption.color })}
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
                onClick={handleAddAccount}
                disabled={!newAccount.name || newAccount.balance === undefined}
              >
                Adicionar conta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saldo total</CardTitle>
          <CardDescription>
            Soma dos saldos de todas as suas contas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">
            {formatCurrency(totalBalance)}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: account.color || "#888" }}
                  />
                  <CardTitle className="text-xl">{account.name}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(account)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(account)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{account.type}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${
                account.balance >= 0 ? "text-financial-income" : "text-financial-expense"
              }`}>
                {formatCurrency(account.balance)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar conta</DialogTitle>
            <DialogDescription>
              Atualize as informações da sua conta
            </DialogDescription>
          </DialogHeader>
          {editingAccount && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome da conta</Label>
                <Input
                  id="edit-name"
                  value={editingAccount.name}
                  onChange={(e) =>
                    setEditingAccount({ ...editingAccount, name: e.target.value })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo de conta</Label>
                <Select
                  value={editingAccount.type}
                  onValueChange={(value) =>
                    setEditingAccount({ ...editingAccount, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center">
                          {type.icon}
                          <span className="ml-2">{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-balance">Saldo</Label>
                <Input
                  id="edit-balance"
                  type="number"
                  step="0.01"
                  value={editingAccount.balance}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      balance: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {ACCOUNT_COLORS.map((colorOption) => (
                    <button
                      key={colorOption.color}
                      type="button"
                      className={`w-8 h-8 rounded-full ${
                        editingAccount.color === colorOption.color
                          ? "ring-2 ring-primary ring-offset-2"
                          : ""
                      }`}
                      style={{ backgroundColor: colorOption.color }}
                      onClick={() =>
                        setEditingAccount({
                          ...editingAccount,
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
            <Button onClick={handleEditAccount}>Salvar alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir conta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {accountToDelete && (
              <p>
                Conta: <strong>{accountToDelete.name}</strong>
                <br />
                Saldo: <strong>{formatCurrency(accountToDelete.balance)}</strong>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Excluir conta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Accounts;
