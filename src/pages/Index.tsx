
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar para a página de login
    navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">
          <span className="text-primary">Família</span>
          <span className="text-accent">Finanças</span>
        </h1>
        <p className="text-lg">Redirecionando...</p>
      </div>
    </div>
  );
};

export default Index;
