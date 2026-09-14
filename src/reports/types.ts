export interface ReportDefinition<TData> {
  id: string
  name: string
  description: string
  route: string
  generateExcel: (data: TData) => Promise<Blob>
  generatePdf: (data: TData) => Promise<Blob>
  buildExportBasename: (data: TData) => string
}
