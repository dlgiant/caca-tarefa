/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/tasks/route';
import { PUT, DELETE } from '@/app/api/tasks/[id]/route';
import { prisma } from '@/lib/prisma';
// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));
// Mock do getServerSession
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() =>
    Promise.resolve({ user: { id: 'user-123' } })
  ),
}));
// Mock do authOptions
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));
describe('/api/tasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Task 2',
          description: 'Description 2',
          userId: 'user-123',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);
      const request = new NextRequest('http://localhost:3000/api/tasks');
      const response = await GET(request);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].title).toBe('Task 1');
      expect(prisma.task.findMany).toHaveBeenCalled();
    });
    it('returns 401 for unauthenticated requests', async () => {
      const nextAuth = jest.requireMock('next-auth');
      nextAuth.getServerSession.mockResolvedValueOnce(null);
      const request = new NextRequest('http://localhost:3000/api/tasks');
      const response = await GET(request);
      expect(response.status).toBe(401);
    });
  });
  describe('POST /api/tasks', () => {
    it('creates a new task', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        priority: 'HIGH',
        status: 'TODO',
        dueDate: '2024-12-31',
      };
      const createdTask = {
        id: 'task-123',
        ...newTask,
        userId: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (prisma.task.create as jest.Mock).mockResolvedValue(createdTask);
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(newTask),
      });
      const response = await POST(request);
      const data = await response.json();
      expect(response.status).toBe(201);
      expect(data.id).toBe('task-123');
      expect(data.title).toBe('New Task');
      expect(prisma.task.create).toHaveBeenCalled();
    });
    it('validates required fields', async () => {
      const invalidTask = {
        description: 'Missing title',
      };
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(invalidTask),
      });
      const response = await POST(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });
  describe('PUT /api/tasks/[id]', () => {
    it('updates an existing task', async () => {
      const taskId = 'task-123';
      const updates = {
        title: 'Updated Task',
        status: 'COMPLETED',
      };
      const updatedTask = {
        id: taskId,
        ...updates,
        userId: 'user-123',
        description: 'Original description',
        priority: 'MEDIUM',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (prisma.task.findFirst as jest.Mock).mockResolvedValue({
        id: taskId,
        userId: 'user-123',
      });
      (prisma.task.update as jest.Mock).mockResolvedValue(updatedTask);
      const request = new NextRequest(
        `http://localhost:3000/api/tasks/${taskId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        }
      );
      const response = await PUT(request, { params: { id: taskId } });
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.id).toBe(taskId);
      expect(data.title).toBe('Updated Task');
      expect(prisma.task.update).toHaveBeenCalled();
    });
    it('returns 404 for non-existent task', async () => {
      const taskId = 'non-existent';
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);
      const request = new NextRequest(
        `http://localhost:3000/api/tasks/${taskId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ title: 'Updated' }),
        }
      );
      const response = await PUT(request, { params: { id: taskId } });
      expect(response.status).toBe(404);
    });
  });
  describe('DELETE /api/tasks/[id]', () => {
    it('deletes a task', async () => {
      const taskId = 'task-123';
      (prisma.task.findFirst as jest.Mock).mockResolvedValue({
        id: taskId,
        userId: 'user-123',
      });
      (prisma.task.delete as jest.Mock).mockResolvedValue({ id: taskId });
      const request = new NextRequest(
        `http://localhost:3000/api/tasks/${taskId}`,
        {
          method: 'DELETE',
        }
      );
      const response = await DELETE(request, { params: { id: taskId } });
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.message).toBeDefined();
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
    });
    it('returns 403 for unauthorized deletion', async () => {
      const taskId = 'task-123';
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);
      const request = new NextRequest(
        `http://localhost:3000/api/tasks/${taskId}`,
        {
          method: 'DELETE',
        }
      );
      const response = await DELETE(request, { params: { id: taskId } });
      expect(response.status).toBe(404);
      expect(prisma.task.delete).not.toHaveBeenCalled();
    });
  });
});
