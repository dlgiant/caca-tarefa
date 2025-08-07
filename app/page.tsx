'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ThemeToggle } from '@/components/custom/theme-toggle';
import {
  CheckCircle2,
  ListTodo,
  Users,
  Brain,
  Calendar,
  BarChart3,
  Shield,
  Zap,
  Target,
  Clock,
  FolderOpen,
  MessageSquare,
  ChevronRight,
  Star,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'Atividades Visuais',
      description:
        'Aprendizado com cores, ícones e emojis para facilitar a compreensão e memorização.',
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: 'Sistema de Recompensas',
      description:
        'Ganhe estrelas e troféus ao completar atividades, tornando o aprendizado mais motivador!',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Apoio Familiar',
      description:
        'Pais e professores podem acompanhar o progresso e ajudar nas atividades.',
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: 'Adaptado para Todos',
      description:
        'Interface simples e intuitiva, especialmente desenvolvida para crianças com dificuldades de aprendizagem.',
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: 'Rotina de Estudos',
      description:
        'Organize as atividades diárias de forma visual e fácil de entender.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Ambiente Seguro',
      description:
        'Plataforma protegida e adequada para crianças, com controle parental.',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Usuários Ativos' },
    { value: '500K+', label: 'Tarefas Concluídas' },
    { value: '98%', label: 'Satisfação' },
    { value: '24/7', label: 'Disponibilidade' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Caça Tarefa</span>
          </div>
          <nav className="flex items-center gap-4">
            <ThemeToggle />
            {session ? (
              <Button
                onClick={() => router.push('/dashboard')}
                className="gap-2"
              >
                Ir para Dashboard
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Começar Gratuitamente</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container px-4 py-24 md:py-32">
        <div className="mx-auto max-w-[980px] text-center">
          <div className="mb-4 inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            Powered by AI
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Aprendendo com
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              {' '}
              Diversão e Alegria
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-[700px] text-lg text-muted-foreground sm:text-xl">
            Plataforma educacional adaptada para crianças com dificuldades de
            aprendizagem. Tornando o estudo mais fácil, divertido e acessível
            para todos!
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="gap-2">
              <Link href="/register">
                Começar Agora
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container px-4 py-16">
        <div className="mx-auto max-w-[980px] text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Tudo que você precisa para ser produtivo
          </h2>
          <p className="text-lg text-muted-foreground">
            Ferramentas poderosas para transformar sua gestão de tarefas
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container px-4 py-16 border-y bg-muted/50">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container px-4 py-16">
        <div className="mx-auto max-w-[980px] text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Como Funciona
          </h2>
          <p className="text-lg text-muted-foreground">
            Comece a organizar suas tarefas em 3 passos simples
          </p>
        </div>
        <div className="mx-auto max-w-3xl">
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-2">Crie sua conta gratuita</h3>
                <p className="text-muted-foreground">
                  Cadastre-se em segundos e acesse todas as funcionalidades sem
                  custo.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  Organize suas tarefas e projetos
                </h3>
                <p className="text-muted-foreground">
                  Crie projetos, adicione tarefas, defina prioridades e prazos
                  com facilidade.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  Acompanhe e conquiste seus objetivos
                </h3>
                <p className="text-muted-foreground">
                  Use o dashboard analítico e a IA para otimizar sua
                  produtividade diariamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-24">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Star className="h-12 w-12 mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              Pronto para aumentar sua produtividade?
            </h2>
            <p className="mb-8 max-w-[600px] text-primary-foreground/90">
              Junte-se a milhares de profissionais que já transformaram sua
              forma de trabalhar.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">Criar Conta Gratuita</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/login">Fazer Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              <span className="font-semibold">Caça Tarefa</span>
              <span className="text-sm text-muted-foreground">© 2024</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link
                href="/login"
                className="hover:text-foreground transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="hover:text-foreground transition-colors"
              >
                Registrar
              </Link>
              <Link
                href="/dashboard"
                className="hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
