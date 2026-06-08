import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Download, Trash2, Pencil } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';


const categoryColors = {
  Electronics: '#6366F1', Income: '#10B981', 'Food & Drink': '#F59E0B',
  Transport: '#8B5CF6', Groceries: '#10B981', Entertainment: '#F43F5E',
  Shopping: '#A78BFA', Health: '#10B981', Bills: '#F59E0B',
  Travel: '#6366F1', Education: '#8B5CF6', Other: '#64748B',
};

const getStatusBadge = (status) => {
  const styles = {
    Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Failed: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${styles[status] || 'bg-white/[0.04] text-slate-400 border-white/[0.06]'}`}>
      {status}
    </span>
  );
};

export default function TransactionTable({ onEdit, onExport }) {
  const { transactions, deleteTransaction, formatCurrency } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredData = useMemo(() => {
    return transactions.filter((tx) =>
      tx.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, transactions]);

  const sortedData = useMemo(() => {
    let items = [...filteredData];
    if (sortConfig.key) {
      items.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col w-full animate-fade-in-up stagger-5">
      {/* Toolbar */}
      <div className="p-4 sm:p-5 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/30 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <button
          onClick={onExport}
          className="flex items-center justify-center space-x-2 bg-white/[0.04] border border-white/[0.06] text-slate-400 font-medium rounded-xl px-4 py-2 hover:bg-white/[0.06] hover:text-slate-300 transition-all text-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
          <thead className="bg-white/[0.02] border-b border-white/[0.06]">
            <tr>
              {['date', 'merchant', 'category', 'amount', 'status'].map((key) => (
                <th
                  key={key}
                  className={`py-3 px-4 text-[10px] font-semibold text-slate-600 uppercase tracking-[0.12em] cursor-pointer hover:text-slate-400 transition-colors select-none group ${key === 'amount' ? 'text-right' : ''}`}
                  onClick={() => handleSort(key)}
                >
                  <div className={`flex items-center space-x-1 ${key === 'amount' ? 'justify-end' : ''}`}>
                    <span>{key}</span>
                    <ArrowUpDown className={`w-2.5 h-2.5 ${sortConfig.key === key ? 'text-indigo-400' : 'text-slate-700 group-hover:text-slate-500'}`} />
                  </div>
                </th>
              ))}
              <th className="py-3 px-4 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {currentData.length > 0 ? (
              currentData.map((tx, idx) => (
                <tr 
                  key={tx.id} 
                  className="hover:bg-white/[0.02] transition-all duration-200 group animate-slide-in-right"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <td className="py-3.5 px-4 text-xs text-slate-600 font-mono">{tx.date}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      {/* Merchant avatar */}
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                        style={{ backgroundColor: `${categoryColors[tx.category] || '#6366F1'}15` }}
                      >
                        {tx.emoji}
                      </div>
                      <span className="font-medium text-sm text-slate-200 group-hover:text-indigo-300 transition-colors">{tx.merchant}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span 
                      className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold border"
                      style={{ 
                        backgroundColor: `${categoryColors[tx.category] || '#6366F1'}10`,
                        color: categoryColors[tx.category] || '#6366F1',
                        borderColor: `${categoryColors[tx.category] || '#6366F1'}20`,
                      }}
                    >
                      {tx.category}
                    </span>
                  </td>
                  <td className={`py-3.5 px-4 text-sm font-bold text-right font-mono tracking-tight ${tx.amount > 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                  </td>
                  <td className="py-3.5 px-4">{getStatusBadge(tx.status)}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-0.5">
                      <button
                        onClick={() => onEdit && onEdit(tx)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-indigo-500/10 text-slate-700 hover:text-indigo-400 transition-all"
                        title="Edit transaction"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-slate-700 hover:text-rose-400 transition-all"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-3">
                      <Search className="w-5 h-5 text-slate-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-400">No transactions found</p>
                    <p className="text-xs text-slate-600 mt-1">Try adjusting your search criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
        <div className="text-xs text-slate-600">
          Showing <span className="font-medium text-slate-400">{sortedData.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0}</span> to <span className="font-medium text-slate-400">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> of <span className="font-medium text-slate-400">{sortedData.length}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-white/[0.06] hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-500 font-medium px-2 font-mono">
            {totalPages > 0 ? currentPage : 0}/{totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-white/[0.06] hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
