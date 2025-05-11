import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { formatCurrency } from "@/utils/formatters";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const CashFlow = ({ transactions, goals }: { transactions: any[]; goals: any[] }) => {
  // Agrupar transações por mês
  const monthlyData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    if (!acc[monthYear]) {
      acc[monthYear] = {
        income: 0,
        expense: 0,
      };
    }
    if (transaction.type === "entrada") {
      acc[monthYear].income += transaction.amount;
    } else {
      acc[monthYear].expense += transaction.amount;
    }
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  // Ordenar meses
  const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
    const [monthA, yearA] = a.split('/').map(Number);
    const [monthB, yearB] = b.split('/').map(Number);
    return yearA === yearB ? monthA - monthB : yearA - yearB;
  });

  // Metas por mês (exemplo: meta total dividida igualmente)
  const metaMensal = goals.length > 0 ? goals.reduce((sum, g) => sum + g.targetAmount, 0) / 12 : 0;
  const metas = sortedMonths.map(() => metaMensal);

  // Preparar dados para o gráfico
  const data = {
    labels: sortedMonths,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Entradas',
        data: sortedMonths.map(month => monthlyData[month].income),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        order: 1,
      },
      {
        type: 'bar' as const,
        label: 'Saídas',
        data: sortedMonths.map(month => monthlyData[month].expense),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        order: 1,
      },
      {
        type: 'line' as const,
        label: 'Meta',
        data: metas,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 2,
        fill: false,
        pointRadius: 3,
        tension: 0.3,
        order: 2,
      },
    ],
  } as any;

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => formatCurrency(Number(value)),
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de Caixa</CardTitle>
      </CardHeader>
      <CardContent>
        <Bar data={data} options={options} />
      </CardContent>
    </Card>
  );
}; 