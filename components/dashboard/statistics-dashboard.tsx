'use client';
import { useState, useEffect } from 'react';
interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  tasksByPriority: Array<{ name: string; value: number }>;
  tasksByStatus: Array<{ name: string; value: number }>;
  tasksByCategory: Array<{ name: string; value: number; color: string }>;
  weeklyProgress: Array<{ day: string; completed: number; created: number }>;
  monthlyProgress: Array<{ week: string; completed: number; created: number }>;
  productivityScore: number;
}
const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
};
export function StatisticsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>(
    'month'
  );
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchDashboardStats();
  }, [timeRange]);
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/stats?range=${timeRange}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  const statCards = [
    {
      title: 'Total de Tarefas',
      value: stats.totalTasks,
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Tarefas Concluídas',
      value: stats.completedTasks,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Tarefas Pendentes',
      value: stats.pendingTasks,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
    {
      title: 'Tarefas Atrasadas',
      value: stats.overdueTasks,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950',
    },
  ];
  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Tabs
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as any)}
        >
          <TabsList>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mês</TabsTrigger>
            <TabsTrigger value="year">Ano</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de Progresso */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso ao Longo do Tempo</CardTitle>
            <CardDescription>Tarefas criadas vs concluídas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={
                  timeRange === 'week'
                    ? stats.weeklyProgress
                    : stats.monthlyProgress
                }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={timeRange === 'week' ? 'day' : 'week'} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="created"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  name="Criadas"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke={COLORS.success}
                  strokeWidth={2}
                  name="Concluídas"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Gráfico de Status */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
            <CardDescription>Status atual das tarefas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.tasksByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.tasksByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        Object.values(COLORS)[
                          index % Object.values(COLORS).length
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Gráfico de Prioridades */}
        <Card>
          <CardHeader>
            <CardTitle>Tarefas por Prioridade</CardTitle>
            <CardDescription>Distribuição das prioridades</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.tasksByPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={COLORS.primary}>
                  {stats.tasksByPriority.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === 'URGENT'
                          ? COLORS.danger
                          : entry.name === 'HIGH'
                            ? COLORS.warning
                            : entry.name === 'MEDIUM'
                              ? COLORS.primary
                              : COLORS.success
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Gráfico de Categorias */}
        <Card>
          <CardHeader>
            <CardTitle>Tarefas por Categoria</CardTitle>
            <CardDescription>Distribuição entre categorias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.tasksByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="value">
                  {stats.tasksByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || COLORS.primary}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      {/* Métricas Adicionais */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conclusão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.completionRate > 70
                ? 'Excelente!'
                : stats.completionRate > 50
                  ? 'Bom progresso'
                  : 'Precisa melhorar'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tempo Médio de Conclusão
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageCompletionTime} dias
            </div>
            <p className="text-xs text-muted-foreground">
              Média de tempo para concluir tarefas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Score de Produtividade
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.productivityScore}/100
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2.5 rounded-full"
                  style={{ width: `${stats.productivityScore}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
