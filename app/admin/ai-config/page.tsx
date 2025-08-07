'use client';

import { useState, useEffect } from 'react';
import { Bot, Save, Settings } from 'lucide-react';
import { toast } from 'sonner';

const CLAUDE_MODELS = [
  { 
    id: 'claude-3-5-sonnet-20241022', 
    name: 'Claude 3.5 Sonnet',
    description: 'Modelo mais recente e poderoso, ideal para tarefas complexas'
  },
  { 
    id: 'claude-3-5-haiku-20241022', 
    name: 'Claude 3.5 Haiku',
    description: 'Modelo rápido e eficiente para tarefas simples'
  },
  { 
    id: 'claude-3-opus-20240229', 
    name: 'Claude 3 Opus',
    description: 'Modelo anterior mais poderoso, ótimo para análises profundas'
  },
  { 
    id: 'claude-3-sonnet-20240229', 
    name: 'Claude 3 Sonnet',
    description: 'Modelo balanceado para uso geral'
  },
  { 
    id: 'claude-3-haiku-20240307', 
    name: 'Claude 3 Haiku',
    description: 'Modelo mais rápido e econômico'
  }
];

export default function AIConfigPage() {
  const [selectedModel, setSelectedModel] = useState('');
  const [currentModel, setCurrentModel] = useState<{ name: string; displayName: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCurrentConfig();
  }, []);

  const fetchCurrentConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/ai-config');
      if (response.ok) {
        const data = await response.json();
        setCurrentModel(data.model);
        setSelectedModel(data.model?.name || 'claude-3-5-sonnet-20241022');
      }
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      toast.error('Erro ao carregar configuração atual');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const model = CLAUDE_MODELS.find(m => m.id === selectedModel);
    if (!model) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: model.id,
          displayName: model.name
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentModel(data.model);
        toast.success('Configuração salva com sucesso!');
      } else {
        throw new Error('Erro ao salvar configuração');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configuração');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bot className="w-8 h-8 text-purple-600" />
          Configuração do Assistente IA
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configure o modelo Claude para o assistente virtual
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Modelo Atual */}
          {currentModel && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Settings className="w-5 h-5" />
                <span className="font-semibold">Modelo Atual</span>
              </div>
              <p className="mt-2 text-blue-900 dark:text-blue-100">
                {currentModel.displayName}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                ID: {currentModel.name}
              </p>
            </div>
          )}

          {/* Seleção de Modelo */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Selecionar Modelo</h2>
              
              <div className="space-y-3">
                {CLAUDE_MODELS.map((model) => (
                  <label
                    key={model.id}
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedModel === model.id
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="model"
                        value={model.id}
                        checked={selectedModel === model.id}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="mt-1 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {model.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {model.description}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          ID: {model.id}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving || !selectedModel || selectedModel === currentModel?.name}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Configuração
                </>
              )}
            </button>
          </div>

          {/* Informações Adicionais */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-8">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Informações Importantes
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>A mudança de modelo afeta imediatamente todas as conversas do assistente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Modelos Sonnet são balanceados entre velocidade e qualidade</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Modelos Haiku são mais rápidos e econômicos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Modelo Opus oferece a melhor qualidade mas é mais lento</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Certifique-se de que sua chave API tem acesso ao modelo selecionado</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
