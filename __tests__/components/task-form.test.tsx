import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskForm } from '@/components/tasks/task-form'

// Mock do useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}))

describe('TaskForm Component', () => {
  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all form fields', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/prioridade/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/data de vencimento/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    const submitButton = screen.getByRole('button', { name: /salvar/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument()
    })
    
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    const titleInput = screen.getByLabelText(/título/i)
    const descriptionInput = screen.getByLabelText(/descrição/i)
    const submitButton = screen.getByRole('button', { name: /salvar/i })
    
    await user.type(titleInput, 'Nova Tarefa')
    await user.type(descriptionInput, 'Descrição da tarefa')
    
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Nova Tarefa',
          description: 'Descrição da tarefa',
        })
      )
    })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    await user.click(cancelButton)
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('populates form when editing existing task', () => {
    const existingTask = {
      id: '1',
      title: 'Tarefa Existente',
      description: 'Descrição existente',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      dueDate: new Date('2024-12-31'),
      category: 'work',
    }
    
    render(
      <TaskForm 
        task={existingTask} 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    )
    
    expect(screen.getByDisplayValue('Tarefa Existente')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Descrição existente')).toBeInTheDocument()
  })

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup()
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting />)
    
    const submitButton = screen.getByRole('button', { name: /salvando/i })
    expect(submitButton).toBeDisabled()
  })
})
