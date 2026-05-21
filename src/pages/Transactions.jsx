import React, { useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import TransactionTable from '../components/ui/TransactionTable';
import AddTransactionModal from '../components/ui/AddTransactionModal';
import EditTransactionModal from '../components/ui/EditTransactionModal';

export default function Transactions() {
  const { transactions, addTransaction, deleteTransaction, updateTransaction } = useFinance();
  const { addToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const handleAddTransaction = (data) => {
    addTransaction(data);
    addToast('Transaction added successfully');
  };

  const handleEditSubmit = (id, updates) => {
    updateTransaction(id, updates);
    addToast('Transaction updated');
    setEditingTransaction(null);
  };

  const handleDelete = (txId) => {
    deleteTransaction(txId);
    addToast('Transaction deleted', 'info');
  };

  const handleExport = () => {
    if (!transactions || transactions.length === 0) {
      addToast('No transactions to export', 'error');
      return;
    }

    const headers = ['Date', 'Merchant', 'Category', 'Amount', 'Status'];
    const rows = transactions.map((tx) => [
      tx.date,
      `"${tx.merchant.replace(/"/g, '""')}"`,
      tx.category,
      tx.amount.toFixed(2),
      tx.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Transactions exported successfully');
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h2 className="text-xl font-bold text-slate-50 tracking-tight">Transactions</h2>
          <p className="text-xs text-slate-600 mt-1">Review and manage your complete transaction history.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 bg-white/[0.04] border border-white/[0.06] text-slate-400 font-medium rounded-xl px-3 py-2 hover:bg-white/[0.06] hover:text-slate-300 transition-all text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl px-4 py-2 hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all text-xs active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      <TransactionTable
        onEdit={(tx) => setEditingTransaction(tx)}
        onExport={handleExport}
      />

      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddTransaction}
      />

      <EditTransactionModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSubmit={handleEditSubmit}
        transaction={editingTransaction}
      />
    </div>
  );
}
