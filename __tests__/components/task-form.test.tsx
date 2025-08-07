import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '@/components/tasks/task-form';
// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => [],
  })
) as jest.Mock;
// Mock do useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));
// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
describe('TaskForm Component', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock to return empty arrays for categories/projects/tags
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      return Promise.resolve({
        ok: true,
        json: async () => {
          // Return empty arrays for API endpoints
          if (
            url.includes('/api/categories') ||
            url.includes('/api/projects') ||
            url.includes('/api/tags')
          ) {
            return [];
          }
          return { id: '1', title: 'Task' };
        },
      });
    });
  });
  it('renders all form fields', async () => {
    await act(async () => {
      render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    });
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prioridade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data de vencimento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
  });
  it('validates required fields', async () => {
    await act(async () => {
      render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    });
    const submitButton = screen.getByRole('button', { name: /criar tarefa/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/obrigatório/i)).toBeInTheDocument();
    });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    });
    const titleInput = screen.getByLabelText(/título/i);
    const descriptionInput = screen.getByLabelText(/descrição/i);
    const submitButton = screen.getByRole('button', { name: /criar tarefa/i });
    await user.type(titleInput, 'Nova Tarefa');
    await user.type(descriptionInput, 'Descrição da tarefa');
    await user.click(submitButton);
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    });
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
  it('populates form when editing existing task', async () => {
    const existingTask = {
      id: '1',
      title: 'Tarefa Existente',
      description: 'Descrição existente',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      dueDate: new Date('2024-12-31'),
      categoryId: 'cat-1',
      tags: [{ name: 'work' }],
    };
    await act(async () => {
      render(
        <TaskForm
          task={existingTask}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );
    });
    expect(screen.getByDisplayValue('Tarefa Existente')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Descrição existente')).toBeInTheDocument();
  });
  it('calls onSuccess after successful submission', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    });
    const titleInput = screen.getByLabelText(/título/i);
    await user.type(titleInput, 'Test Task');
    const submitButton = screen.getByRole('button', { name: /criar tarefa/i });
    await user.click(submitButton);
    // Check if onSuccess is called after submission
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
