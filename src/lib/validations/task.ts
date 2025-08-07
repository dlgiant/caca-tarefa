import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  completed: z.boolean().default(false),
});

export const updateTaskSchema = taskSchema.partial();

export const taskFilterSchema = z.object({
  search: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  completed: z.boolean().optional(),
  categoryId: z.string().optional(),
  projectId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(["createdAt", "dueDate", "priority", "title"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const taskOrderSchema = z.object({
  taskIds: z.array(z.string()).min(1),
});

export type TaskInput = z.infer<typeof taskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskFilter = z.infer<typeof taskFilterSchema>;
export type TaskOrder = z.infer<typeof taskOrderSchema>;
