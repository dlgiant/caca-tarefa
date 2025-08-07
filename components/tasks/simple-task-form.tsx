'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Palette,
  Music,
  Calculator,
  Globe,
  Sparkles,
  Star,
  Heart,
  Smile,
  Trophy,
  Gamepad2,
  Puzzle,
} from 'lucide-react';
import { toast } from 'sonner';

interface SimpleTaskFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Subject icons and colors for visual learning
const subjects = [
  {
    id: 'reading',
    name: 'Leitura',
    icon: BookOpen,
    color: 'bg-blue-500',
    emoji: '📚',
  },
  {
    id: 'math',
    name: 'Matemática',
    icon: Calculator,
    color: 'bg-green-500',
    emoji: '🔢',
  },
  {
    id: 'art',
    name: 'Arte',
    icon: Palette,
    color: 'bg-purple-500',
    emoji: '🎨',
  },
  {
    id: 'music',
    name: 'Música',
    icon: Music,
    color: 'bg-pink-500',
    emoji: '🎵',
  },
  {
    id: 'science',
    name: 'Ciências',
    icon: Globe,
    color: 'bg-yellow-500',
    emoji: '🔬',
  },
  {
    id: 'games',
    name: 'Jogos',
    icon: Gamepad2,
    color: 'bg-orange-500',
    emoji: '🎮',
  },
  {
    id: 'puzzle',
    name: 'Quebra-cabeça',
    icon: Puzzle,
    color: 'bg-indigo-500',
    emoji: '🧩',
  },
];

// Difficulty levels with visual indicators
const difficulties = [
  { id: 'easy', name: 'Fácil', icon: Smile, color: 'bg-green-400', stars: 1 },
  { id: 'medium', name: 'Médio', icon: Star, color: 'bg-yellow-400', stars: 2 },
  {
    id: 'hard',
    name: 'Difícil',
    icon: Trophy,
    color: 'bg-orange-400',
    stars: 3,
  },
];

export function SimpleTaskForm({ onSuccess, onCancel }: SimpleTaskFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('easy');
  const [showReward, setShowReward] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskName.trim()) {
      toast.error('Por favor, dê um nome para sua atividade! 😊');
      return;
    }

    if (!selectedSubject) {
      toast.error('Escolha uma matéria! 🎯');
      return;
    }

    setIsLoading(true);
    try {
      const taskData = {
        title: taskName,
        description: `Matéria: ${subjects.find((s) => s.id === selectedSubject)?.name}`,
        priority:
          selectedDifficulty === 'hard'
            ? 'HIGH'
            : selectedDifficulty === 'medium'
              ? 'MEDIUM'
              : 'LOW',
        categoryId: null,
        projectId: null,
        tags: [selectedSubject],
        completed: false,
        dueDate: null,
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar atividade');
      }

      // Show reward animation
      setShowReward(true);
      setTimeout(() => {
        toast.success('Parabéns! Atividade criada! 🎉🌟');
        router.refresh();
        onSuccess?.();
      }, 1500);
    } catch (error) {
      toast.error('Ops! Algo deu errado. Tente novamente! 😔');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Reward Animation */}
      {showReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="animate-bounce text-8xl">🌟</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Task Name - Big and Simple */}
        <div className="space-y-2">
          <label className="text-2xl font-bold text-primary flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-yellow-500" />O que vamos aprender
            hoje?
          </label>
          <Input
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Digite aqui..."
            className="text-xl p-6 border-4 border-primary/20 focus:border-primary/50"
            autoFocus
          />
        </div>

        {/* Subject Selection - Visual Cards */}
        <div className="space-y-2">
          <label className="text-xl font-bold text-primary">
            Escolha a matéria:
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {subjects.map((subject) => {
              const Icon = subject.icon;
              return (
                <Card
                  key={subject.id}
                  className={cn(
                    'cursor-pointer transition-all hover:scale-105',
                    'border-4',
                    selectedSubject === subject.id
                      ? 'border-primary shadow-lg scale-105'
                      : 'border-transparent hover:border-primary/30'
                  )}
                  onClick={() => setSelectedSubject(subject.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div
                      className={cn(
                        'mx-auto mb-2 h-16 w-16 rounded-full flex items-center justify-center',
                        subject.color
                      )}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-lg font-semibold">{subject.name}</div>
                    <div className="text-3xl mt-1">{subject.emoji}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Difficulty Selection - Visual with Stars */}
        <div className="space-y-2">
          <label className="text-xl font-bold text-primary">
            Qual o nível?
          </label>
          <div className="grid grid-cols-3 gap-4">
            {difficulties.map((level) => {
              const Icon = level.icon;
              return (
                <Card
                  key={level.id}
                  className={cn(
                    'cursor-pointer transition-all hover:scale-105',
                    'border-4',
                    selectedDifficulty === level.id
                      ? 'border-primary shadow-lg scale-105'
                      : 'border-transparent hover:border-primary/30'
                  )}
                  onClick={() => setSelectedDifficulty(level.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div
                      className={cn(
                        'mx-auto mb-2 h-12 w-12 rounded-full flex items-center justify-center',
                        level.color
                      )}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-lg font-semibold">{level.name}</div>
                    <div className="flex justify-center mt-2">
                      {Array.from({ length: level.stars }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Action Buttons - Big and Colorful */}
        <div className="flex gap-4 justify-center pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="text-lg px-8 py-6 border-2"
            >
              Voltar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="text-lg px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {isLoading ? (
              <>Criando...</>
            ) : (
              <>
                <Trophy className="mr-2 h-6 w-6" />
                Criar Atividade!
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
