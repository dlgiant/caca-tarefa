'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, FileSpreadsheet, FileText, FileJson, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import * as Papa from 'papaparse'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

type ExportFormat = 'CSV' | 'PDF' | 'JSON' | 'EXCEL'
type DataType = 'tasks' | 'projects' | 'all'

interface ExportOptions {
  format: ExportFormat
  dataType: DataType
  includeCompleted: boolean
  includePending: boolean
  includeCancelled: boolean
  dateRange: 'all' | 'week' | 'month' | 'year'
}

const formatIcons = {
  CSV: FileSpreadsheet,
  PDF: FileText,
  JSON: FileJson,
  EXCEL: FileSpreadsheet,
}

const formatLabels = {
  CSV: 'CSV',
  PDF: 'PDF',
  JSON: 'JSON',
  EXCEL: 'Excel',
}

export function DataExport() {
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<ExportOptions>({
    format: 'CSV',
    dataType: 'tasks',
    includeCompleted: true,
    includePending: true,
    includeCancelled: false,
    dateRange: 'all',
  })

  const fetchData = async () => {
    const params = new URLSearchParams({
      dataType: options.dataType,
      includeCompleted: options.includeCompleted.toString(),
      includePending: options.includePending.toString(),
      includeCancelled: options.includeCancelled.toString(),
      dateRange: options.dateRange,
    })

    const response = await fetch(`/api/export/data?${params}`)
    if (!response.ok) {
      throw new Error('Erro ao buscar dados')
    }
    return response.json()
  }

  const exportToCSV = (data: any[], filename: string) => {
    const csv = Papa.unparse(data, {
      header: true,
      delimiter: ',',
    })
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const exportToJSON = (data: any[], filename: string) => {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.json`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const exportToPDF = (data: any[], filename: string) => {
    const doc = new jsPDF()
    
    // Título
    doc.setFontSize(20)
    doc.text('Relatório de Tarefas', 14, 22)
    
    // Data de exportação
    doc.setFontSize(10)
    doc.text(`Exportado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30)
    
    // Preparar dados para a tabela
    const headers = Object.keys(data[0] || {})
    const rows = data.map(item => headers.map(header => {
      const value = item[header]
      if (value === null || value === undefined) return ''
      if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
      if (value instanceof Date) return new Date(value).toLocaleDateString('pt-BR')
      return String(value)
    }))
    
    // Adicionar tabela
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    })
    
    doc.save(`${filename}.pdf`)
  }

  const exportToExcel = async (data: any[], filename: string) => {
    // Para Excel, vamos criar um CSV que pode ser aberto no Excel
    // Uma implementação completa usaria uma biblioteca como xlsx
    const csv = Papa.unparse(data, {
      header: true,
      delimiter: ';', // Usar ponto e vírgula para melhor compatibilidade com Excel
    })
    
    // Adicionar BOM para UTF-8
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const handleExport = async () => {
    try {
      setLoading(true)
      
      // Buscar dados
      const data = await fetchData()
      
      if (!data || data.length === 0) {
        toast.warning('Nenhum dado para exportar')
        return
      }
      
      // Gerar nome do arquivo
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `export_${options.dataType}_${timestamp}`
      
      // Exportar conforme o formato selecionado
      switch (options.format) {
        case 'CSV':
          exportToCSV(data, filename)
          break
        case 'JSON':
          exportToJSON(data, filename)
          break
        case 'PDF':
          exportToPDF(data, filename)
          break
        case 'EXCEL':
          exportToExcel(data, filename)
          break
      }
      
      toast.success(`Dados exportados com sucesso!`)
      
      // Registrar exportação no servidor
      await fetch('/api/export/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: options.format,
          dataType: options.dataType,
          recordCount: data.length,
        }),
      })
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      toast.error('Erro ao exportar dados')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar Dados
        </CardTitle>
        <CardDescription>
          Exporte seus dados em diferentes formatos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seleção de Formato */}
        <div className="space-y-3">
          <Label>Formato de Exportação</Label>
          <RadioGroup
            value={options.format}
            onValueChange={(value) => setOptions({ ...options, format: value as ExportFormat })}
          >
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(formatLabels) as ExportFormat[]).map((format) => {
                const Icon = formatIcons[format]
                return (
                  <div key={format} className="flex items-center space-x-2">
                    <RadioGroupItem value={format} id={format} />
                    <Label
                      htmlFor={format}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Icon className="h-4 w-4" />
                      {formatLabels[format]}
                    </Label>
                  </div>
                )
              })}
            </div>
          </RadioGroup>
        </div>

        {/* Tipo de Dados */}
        <div className="space-y-2">
          <Label htmlFor="dataType">Tipo de Dados</Label>
          <Select
            value={options.dataType}
            onValueChange={(value) => setOptions({ ...options, dataType: value as DataType })}
          >
            <SelectTrigger id="dataType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tasks">Tarefas</SelectItem>
              <SelectItem value="projects">Projetos</SelectItem>
              <SelectItem value="all">Todos os Dados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Período */}
        <div className="space-y-2">
          <Label htmlFor="dateRange">Período</Label>
          <Select
            value={options.dateRange}
            onValueChange={(value) => setOptions({ ...options, dateRange: value as any })}
          >
            <SelectTrigger id="dateRange">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os períodos</SelectItem>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
              <SelectItem value="year">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtros de Status (apenas para tarefas) */}
        {options.dataType === 'tasks' && (
          <div className="space-y-3">
            <Label>Incluir Status</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="completed"
                  checked={options.includeCompleted}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, includeCompleted: !!checked })
                  }
                />
                <Label htmlFor="completed" className="cursor-pointer">
                  Tarefas concluídas
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pending"
                  checked={options.includePending}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, includePending: !!checked })
                  }
                />
                <Label htmlFor="pending" className="cursor-pointer">
                  Tarefas pendentes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cancelled"
                  checked={options.includeCancelled}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, includeCancelled: !!checked })
                  }
                />
                <Label htmlFor="cancelled" className="cursor-pointer">
                  Tarefas canceladas
                </Label>
              </div>
            </div>
          </div>
        )}

        {/* Informações do Formato */}
        <div className="rounded-lg border p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground">
            {options.format === 'CSV' && 
              'Formato ideal para importar em planilhas como Excel ou Google Sheets.'}
            {options.format === 'PDF' && 
              'Gera um relatório formatado para impressão ou compartilhamento.'}
            {options.format === 'JSON' && 
              'Formato estruturado para integração com outros sistemas.'}
            {options.format === 'EXCEL' && 
              'Arquivo otimizado para abrir diretamente no Microsoft Excel.'}
          </p>
        </div>

        {/* Botão de Exportação */}
        <Button
          onClick={handleExport}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Exportar Dados
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
