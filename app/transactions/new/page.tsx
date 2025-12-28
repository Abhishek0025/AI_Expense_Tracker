import TransactionForm from '@/components/TransactionForm'

export default function NewTransactionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">New Transaction</h1>
        <p className="text-gray-600 mt-2">Create a new expense or income transaction</p>
      </div>
      <TransactionForm />
    </div>
  )
}

