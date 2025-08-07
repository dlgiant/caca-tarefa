"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Folder, Tag } from "lucide-react";

export function QuickManage() {
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#6B7280");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName, color: categoryColor }),
      });

      if (response.ok) {
        toast.success("Categoria criada com sucesso!");
        setCategoryName("");
        setCategoryColor("#6B7280");
        setIsOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao criar categoria");
      }
    } catch (error) {
      toast.error("Erro ao criar categoria");
    }
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast.error("Nome do projeto é obrigatório");
      return;
    }

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: projectName, 
          description: projectDescription 
        }),
      });

      if (response.ok) {
        toast.success("Projeto criado com sucesso!");
        setProjectName("");
        setProjectDescription("");
        setIsOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao criar projeto");
      }
    } catch (error) {
      toast.error("Erro ao criar projeto");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Gerenciar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciamento Rápido</DialogTitle>
          <DialogDescription>
            Crie categorias e projetos para organizar suas tarefas
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="category" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="category">
              <Tag className="mr-2 h-4 w-4" />
              Categoria
            </TabsTrigger>
            <TabsTrigger value="project">
              <Folder className="mr-2 h-4 w-4" />
              Projeto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="category" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nome da Categoria</Label>
              <Input
                id="category-name"
                placeholder="Ex: Trabalho, Pessoal, Estudos"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-color">Cor</Label>
              <div className="flex gap-2">
                <Input
                  id="category-color"
                  type="color"
                  value={categoryColor}
                  onChange={(e) => setCategoryColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  value={categoryColor}
                  onChange={(e) => setCategoryColor(e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>

            <Button onClick={handleCreateCategory} className="w-full">
              Criar Categoria
            </Button>
          </TabsContent>

          <TabsContent value="project" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Nome do Projeto</Label>
              <Input
                id="project-name"
                placeholder="Ex: Website Redesign, App Mobile"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">Descrição</Label>
              <Input
                id="project-description"
                placeholder="Descrição do projeto (opcional)"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </div>

            <Button onClick={handleCreateProject} className="w-full">
              Criar Projeto
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
