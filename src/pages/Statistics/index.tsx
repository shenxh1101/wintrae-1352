import { useMemo } from 'react';
import {
  Line,
  Doughnut,
  Bar,
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {
  TrendingUp,
  DollarSign,
  BedDouble,
  Users,
  BarChart3,
  PieChart,
} from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import DataCard from '@/components/DataCard';
import {
  generateDailyStats,
  channelData,
  monthlyData,
  summaryStats,
} from '@/data/statistics';
import { formatMoney, formatPercent } from '@/utils/date';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Statistics() {
  const dailyStats = useMemo(() => generateDailyStats(), []);

  const occupancyChartData = {
    labels: dailyStats.map((s) => s.date.slice(5)),
    datasets: [
      {
        label: '入住率',
        data: dailyStats.map((s) => s.occupancyRate * 100),
        borderColor: '#7CB342',
        backgroundColor: 'rgba(124, 179, 66, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#7CB342',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const priceChartData = {
    labels: dailyStats.slice(-14).map((s) => s.date.slice(5)),
    datasets: [
      {
        label: '平均房价',
        data: dailyStats.slice(-14).map((s) => s.avgPrice),
        borderColor: '#C9A961',
        backgroundColor: 'rgba(201, 169, 97, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#C9A961',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const channelChartData = {
    labels: channelData.map((c) => c.name),
    datasets: [
      {
        data: channelData.map((c) => c.value),
        backgroundColor: channelData.map((c) => c.color),
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const revenueChartData = {
    labels: monthlyData.map((m) => m.month),
    datasets: [
      {
        label: '月度营收',
        data: monthlyData.map((m) => m.revenue),
        backgroundColor: 'rgba(139, 105, 20, 0.8)',
        borderRadius: 6,
        barThickness: 32,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#3A2906',
        bodyColor: '#503909',
        borderColor: '#E8DFD0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        titleFont: {
          size: 13,
          weight: '600' as const,
        },
        bodyFont: {
          size: 12,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#B0BEC5',
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: '#F5F0E8',
        },
        ticks: {
          color: '#B0BEC5',
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#503909',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#3A2906',
        bodyColor: '#503909',
        borderColor: '#E8DFD0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context: { label: string; raw: number }) => {
            return `${context.label}: ${context.raw}%`;
          },
        },
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        ticks: {
          ...chartOptions.scales.y.ticks,
          callback: (value: number | string) => {
            const num = typeof value === 'string' ? parseInt(value) : value;
            return `¥${(num / 1000).toFixed(0)}k`;
          },
        },
      },
    },
  };

  return (
    <Layout title="经营统计" subtitle="查看经营数据和趋势分析">
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DataCard
            title="本月入住率"
            value={`${(summaryStats.monthOccupancy * 100).toFixed(1)}%`}
            color="sage"
            icon={<BedDouble className="w-5 h-5" />}
            trend={summaryStats.occupancyTrend}
            trendLabel="较上月"
          />
          <DataCard
            title="本月营收"
            value={`¥${(summaryStats.monthRevenue / 1000).toFixed(1)}k`}
            color="wood"
            icon={<DollarSign className="w-5 h-5" />}
            trend={summaryStats.revenueTrend}
            trendLabel="较上月"
          />
          <DataCard
            title="平均房价"
            value={`¥${summaryStats.avgPrice}`}
            color="bronze"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <DataCard
            title="本月订单"
            value={summaryStats.monthOrders}
            suffix="单"
            color="coral"
            icon={<Users className="w-5 h-5" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-sage-400/10">
                  <TrendingUp className="w-5 h-5 text-sage-500" />
                </div>
                <div>
                  <h3 className="font-medium text-wood-800">入住率趋势</h3>
                  <p className="text-xs text-wood-400">近30天数据</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-sage-400"></span>
                  <span className="text-wood-500">入住率</span>
                </span>
              </div>
            </div>
            <div className="h-64">
              <Line data={occupancyChartData} options={chartOptions} />
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-lg bg-bronze-400/10">
                <PieChart className="w-5 h-5 text-bronze-500" />
              </div>
              <div>
                <h3 className="font-medium text-wood-800">渠道占比</h3>
                <p className="text-xs text-wood-400">本月订单来源</p>
              </div>
            </div>
            <div className="h-64">
              <Doughnut data={channelChartData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-lg bg-coral-400/10">
                <BarChart3 className="w-5 h-5 text-coral-500" />
              </div>
              <div>
                <h3 className="font-medium text-wood-800">月度营收</h3>
                <p className="text-xs text-wood-400">近6个月数据</p>
              </div>
            </div>
            <div className="h-64">
              <Bar data={revenueChartData} options={barOptions} />
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-lg bg-bronze-400/10">
                <DollarSign className="w-5 h-5 text-bronze-500" />
              </div>
              <div>
                <h3 className="font-medium text-wood-800">平均房价趋势</h3>
                <p className="text-xs text-wood-400">近14天数据</p>
              </div>
            </div>
            <div className="h-64">
              <Line data={priceChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-medium text-wood-800 mb-4">渠道详情</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {channelData.map((channel) => (
              <div
                key={channel.name}
                className="p-4 rounded-xl bg-wood-50 text-center"
              >
                <div
                  className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: `${channel.color}20` }}
                >
                  <span
                    className="text-lg font-serif font-bold"
                    style={{ color: channel.color }}
                  >
                    {channel.value}
                  </span>
                </div>
                <p className="text-sm font-medium text-wood-700">{channel.name}</p>
                <p className="text-xs text-wood-400 mt-0.5">{channel.value}% 占比</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
