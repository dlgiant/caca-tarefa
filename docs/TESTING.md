# Guia de Testes e CI/CD

## 📋 Visão Geral

Este projeto utiliza uma suite completa de testes e integração contínua para garantir qualidade e confiabilidade do código.

## 🧪 Stack de Testes

- **Jest**: Framework de testes JavaScript
- **React Testing Library**: Testes de componentes React
- **Testing Library User Event**: Simulação de interações do usuário
- **Jest DOM**: Matchers customizados para testes DOM

## 🏃‍♂️ Executando Testes

### Testes Unitários

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage

# Executar testes para CI (sem watch, com cobertura)
npm run test:ci
```

### Verificações de Código

```bash
# Verificar tipos TypeScript
npm run type-check

# Executar linter
npm run lint

# Corrigir problemas do linter
npm run lint:fix

# Verificar formatação
npm run format:check

# Formatar código
npm run format
```

## 📝 Escrevendo Testes

### Estrutura de Arquivos

```
__tests__/
├── components/     # Testes de componentes React
├── lib/           # Testes de utilitários e funções
└── api/           # Testes de API routes
```

### Exemplo de Teste de Componente

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('should handle click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Exemplo de Teste de API

```typescript
import { GET } from '@/app/api/tasks/route'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma')

describe('GET /api/tasks', () => {
  it('should return tasks for authenticated user', async () => {
    const mockTasks = [/* ... */]
    prisma.task.findMany.mockResolvedValue(mockTasks)
    
    const response = await GET(new Request('http://localhost/api/tasks'))
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toEqual(mockTasks)
  })
})
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

O projeto utiliza GitHub Actions para automação de CI/CD com os seguintes jobs:

1. **Lint**: Verifica código com ESLint e Prettier
2. **Type Check**: Verifica tipos TypeScript
3. **Test**: Executa suite de testes com cobertura
4. **Build**: Constrói aplicação Next.js
5. **Security**: Executa análise de segurança
6. **Deploy**: Deploy automático para Vercel

### Fluxo de Deploy

- **Pull Requests**: Deploy automático para ambiente de preview
- **Branch main**: Deploy automático para produção
- **Branch develop**: Deploy para ambiente de staging

## 🪝 Git Hooks

### Pre-commit

Executado antes de cada commit:
- Lint-staged nos arquivos modificados
- Verificação de tipos
- Testes relacionados aos arquivos modificados

### Pre-push

Executado antes de cada push:
- Suite completa de testes
- Verificação de tipos
- Linting completo

### Commit-msg

Valida formato das mensagens de commit seguindo Conventional Commits:
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas de manutenção

## 📊 Cobertura de Código

### Metas de Cobertura

- **Projeto**: 80% mínimo
- **Patch**: 80% para novos códigos
- **Componentes críticos**: 90%+

### Visualizando Cobertura

```bash
# Gerar relatório de cobertura
npm run test:coverage

# Abrir relatório HTML
open coverage/lcov-report/index.html
```

### Arquivos Ignorados

- Arquivos de teste (`*.test.ts`, `*.test.tsx`)
- Configurações (`*.config.js`, `*.config.ts`)
- Diretórios de build (`.next/`, `node_modules/`)
- Arquivos de migração (`prisma/`)

## 🚀 Best Practices

### Testes de Componentes

1. **Teste comportamento, não implementação**
   - Foque em como o usuário interage
   - Evite testar detalhes internos

2. **Use queries semânticas**
   - Prefira `getByRole`, `getByLabelText`
   - Evite `getByTestId` quando possível

3. **Mock externo, não interno**
   - Mock APIs e serviços externos
   - Evite mockar componentes internos

### Testes de API

1. **Teste casos de sucesso e erro**
   - Respostas válidas
   - Validação de entrada
   - Autenticação/autorização

2. **Use fixtures consistentes**
   - Dados de teste reutilizáveis
   - Factory functions para mocks

3. **Limpe estado entre testes**
   - `beforeEach` para reset de mocks
   - Isolamento completo entre testes

## 🛠️ Troubleshooting

### Testes Falhando Localmente

```bash
# Limpar cache do Jest
npm test -- --clearCache

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Problemas com Types

```bash
# Regenerar tipos do Prisma
npm run db:generate

# Verificar tipos sem emitir
npm run type-check
```

### Hooks não Executando

```bash
# Reinstalar Husky
npx husky install

# Verificar permissões
chmod +x .husky/*
```

## 📚 Recursos Adicionais

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Codecov](https://docs.codecov.com/)
