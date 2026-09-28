import Papa from 'papaparse'

export interface ParsedCsv {
  headers: string[]
  rows: Record<string, string>[]
}

export function parseCsv(fileText: string): ParsedCsv {
  const result = Papa.parse<Record<string, string>>(fileText, {
    header: true,
    skipEmptyLines: true,
  })
  const headers = result.meta.fields ?? []
  return { headers, rows: result.data }
}

export function rowsToCsv<T extends object>(rows: T[]): string {
  return Papa.unparse(rows as unknown as Record<string, unknown>[])
}
