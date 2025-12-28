'use client'

import { useState, useRef, ChangeEvent } from 'react'
import Papa from 'papaparse'
import { useRouter } from 'next/navigation'
import ModernButton from './ModernButton'

interface CsvRow {
  [key: string]: string
}

export default function CsvUpload() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<CsvRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    insertedCount: number
    failedRows: Array<{ row: number; error: string }>
  } | null>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file')
      return
    }

    setFile(selectedFile)
    setError(null)
    setResult(null)

    // Parse CSV client-side for preview
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`CSV parsing error: ${results.errors[0].message}`)
          return
        }

        const data = results.data as CsvRow[]
        if (data.length === 0) {
          setError('CSV file is empty')
          return
        }

        setHeaders(Object.keys(data[0]))
        setPreviewData(data.slice(0, 20)) // Show first 20 rows
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`)
      },
    })
  }

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/transactions/import-csv', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to import CSV')
      }

      setResult({
        insertedCount: data.insertedCount,
        failedRows: data.failedRows || [],
      })

      // Refresh transactions page if on it
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreviewData([])
    setHeaders([])
    setError(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="csv-file"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select CSV File
        </label>
        <input
          ref={fileInputRef}
          type="file"
          id="csv-file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="mt-1 text-sm text-gray-500">
          CSV should contain columns: date, description, amount, merchant (optional), categoryId (optional)
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          <p className="font-semibold">Import Complete!</p>
          <p className="mt-1">
            Successfully imported {result.insertedCount} transaction(s).
            {result.failedRows.length > 0 && (
              <span className="block mt-1">
                {result.failedRows.length} row(s) failed. See details below.
              </span>
            )}
          </p>
        </div>
      )}

      {result && result.failedRows.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Failed Rows:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
            {result.failedRows.map((failed, idx) => (
              <li key={idx}>
                Row {failed.row}: {failed.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {previewData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Preview (first {previewData.length} rows)
          </h3>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {headers.map((header) => (
                      <td
                        key={header}
                        className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                      >
                        {row[header] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <ModernButton
          onClick={handleSubmit}
          variant="success"
          disabled={!file || loading}
        >
          {loading ? '⏳ Importing...' : '📥 Import CSV'}
        </ModernButton>
        {file && (
          <ModernButton
            onClick={handleReset}
            variant="secondary"
            disabled={loading}
          >
            Reset
          </ModernButton>
        )}
      </div>
    </div>
  )
}

