import CsvUpload from '@/components/CsvUpload'

export default function UploadPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Import Transactions from CSV</h1>
        <p className="text-gray-600 mt-2">
          Upload a CSV file to bulk import transactions. The CSV should contain columns:
          date, description, amount, merchant (optional), categoryId (optional).
        </p>
      </div>
      <CsvUpload />
    </div>
  )
}

