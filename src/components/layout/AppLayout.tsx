
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Menu,
  Home,
  CreditCard,
  PiggyBank,
  Wallet,
  ChartPie,
  Plus,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

const AppLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { label: "Dashboard", icon: <Home className="h-5 w-5" />, path: "/dashboard" },
    { label: "Contas", icon: <Wallet className="h-5 w-5" />, path: "/accounts" },
    { label: "Cartões", icon: <CreditCard className="h-5 w-5" />, path: "/credit-cards" },
    { label: "Transações", icon: <ChartPie className="h-5 w-5" />, path: "/transactions" },
    { label: "Metas", icon: <PiggyBank className="h-5 w-5" />, path: "/goals" },
  ];

  const navigateTo = (path: string) => {
    navigate(path);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-6">
        <h2 className="text-xl font-semibold flex items-center">
          <span className="text-primary">Família</span>
          <span className="text-accent">Finanças</span>
        </h2>
      </div>

      <div className="flex-1 px-2 py-2">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigateTo(item.path)}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Button>
          ))}
        </nav>
      </div>

      {currentUser && (
        <div className="px-4 py-4 mt-auto border-t">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={currentUser.avatarUrl} />
              <AvatarFallback>
                {currentUser.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">{currentUser.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {isMobile ? (
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-40"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
      ) : (
        <div className="w-64 border-r bg-card flex-shrink-0">
          <Sidebar />
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <main className="flex-grow p-4 md:p-6 pb-16 relative">
          <Outlet />

          <Button
            className="fixed bottom-6 right-6 rounded-full shadow-lg"
            size="lg"
            onClick={() => navigate("/transactions/new")}
          >
            <Plus className="mr-1" /> Nova transação
          </Button>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
