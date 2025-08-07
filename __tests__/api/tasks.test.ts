import { NextRequest } from 'next/server'
import { GET, POST, PUT, DELETE } from '@/app/api/tasks/route'
import { prisma } from '@/lib/prisma'

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}))

// Mock do auth
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(() => Promise.resolve({ user: { id: 'user-123' } })),
}))

describe('/api/tasks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/tasks', () => {
    it('returns tasks for authenticated user', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Task 1',
          description: 'Description 1',
          userId: 'user-123',
          status: 'TODO',
          priority: 'MEDIUM',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Task 2',
          description: 'Description 2',
          userId: 'user-123',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      ;(prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks)

      const request = new NextRequest('http://localhost:3000/api/tasks')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockTasks)
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('returns 401 for unauthenticated requests', async () => {
      const auth = require('@/lib/auth').auth
      auth.mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost:3000/api/tasks')
      const response = await GET(request)

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/tasks', () => {
    it('creates a new task', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        priority: 'HIGH',
        status: 'TODO',
        dueDate: '2024-12-31',
      }

      const createdTask = {
        id: 'task-123',
        ...newTask,
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.task.create as jest.Mock).mockResolvedValue(createdTask)

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(newTask),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(createdTask)
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: newTask.title,
          description: newTask.description,
          userId: 'user-123',
        }),
      })
    })

    it('validates required fields', async () => {
      const invalidTask = {
        description: 'Missing title',
      }

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(invalidTask),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('title')
    })
  })

  describe('PUT /api/tasks/[id]', () => {
    it('updates an existing task', async () => {
      const taskId = 'task-123'
      const updates = {
        title: 'Updated Task',
        status: 'COMPLETED',
      }

      const updatedTask = {
        id: taskId,
        ...updates,
        userId: 'user-123',
        description: 'Original description',
        priority: 'MEDIUM',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue({
        id: taskId,
        userId: 'user-123',
      })
      ;(prisma.task.update as jest.Mock).mockResolvedValue(updatedTask)

      const request = new NextRequest(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })

      const response = await PUT(request, { params: { id: taskId } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(updatedTask)
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: updates,
      })
    })

    it('returns 404 for non-existent task', async () => {
      const taskId = 'non-existent'
      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated' }),
      })

      const response = await PUT(request, { params: { id: taskId } })

      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /api/tasks/[id]', () => {
    it('deletes a task', async () => {
      const taskId = 'task-123'

      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue({
        id: taskId,
        userId: 'user-123',
      })
      ;(prisma.task.delete as jest.Mock).mockResolvedValue({ id: taskId })

      const request = new NextRequest(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: taskId } })

      expect(response.status).toBe(204)
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      })
    })

    it('returns 403 for unauthorized deletion', async () => {
      const taskId = 'task-123'

      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue({
        id: taskId,
        userId: 'other-user',
      })

      const request = new NextRequest(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: taskId } })

      expect(response.status).toBe(403)
      expect(prisma.task.delete).not.toHaveBeenCalled()
    })
  })
})
