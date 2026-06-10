import { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownRight, Eye, Copy, Trash2, Pencil, RefreshCw, Link2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import ConnectAccountModal from '../components/ui/ConnectAccountModal';
import EditAccountModal from '../components/ui/EditAccountModal';
import { plaidService } from '../api/plaidService';


export default function Accounts() {
  const { accounts, addAccount, deleteAccount, updateAccount, formatCurrency, fetchAllData } = useFinance();
  const { addToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const hasPlaidAccounts = accounts.some(a => a.isPlaidLinked);

  const handleSyncTransactions = async () => {
    setIsSyncing(true);
    try {
      const res = await plaidService.syncTransactions();
      await fetchAllData();
      if (res.count > 0) {
        addToast(`Successfully synced! Imported ${res.count} new transaction(s).`, 'success');
      } else {
        addToast('Synced successfully! No new transactions found.', 'success');
      }
    } catch (err) {
      console.error('Failed to sync transactions:', err);
      addToast(err.response?.data?.message || err.message || 'Sync failed.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };


  const netWorth = accounts.reduce((acc, a) => acc + (a.convertedBalance || a.balance), 0);
  const totalAssets = accounts.filter(a => (a.convertedBalance || a.balance) > 0).reduce((acc, a) => acc + (a.convertedBalance || a.balance), 0);
  const totalLiabilities = Math.abs(accounts.filter(a => (a.convertedBalance || a.balance) < 0).reduce((acc, a) => acc + (a.convertedBalance || a.balance), 0));

  const handleAddAccount = async (data) => {
    await addAccount(data);
    addToast('Account connected successfully');
  };

  const handleEditSubmit = (id, updates) => {
    updateAccount(id, updates);
    addToast('Account updated');
    setEditingAccount(null);
  };

  const handleDelete = (accountId) => {
    deleteAccount(accountId);
    addToast('Account removed', 'info');
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h2 className="text-xl font-bold text-slate-50 tracking-tight">Accounts</h2>
          <p className="text-xs text-slate-600 mt-1">Manage your connected financial accounts.</p>
        </div>
        <div className="flex items-center space-x-2">
          {hasPlaidAccounts && (
            <button
              onClick={handleSyncTransactions}
              disabled={isSyncing}
              className="flex items-center space-x-2 bg-white/[0.04] border border-white/[0.06] text-slate-400 font-semibold rounded-xl px-4 py-2 hover:bg-white/[0.06] hover:text-slate-300 transition-all text-xs active:scale-[0.98] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Bank'}</span>
            </button>
          )}
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl px-4 py-2 hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all text-xs active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Account</span>
          </button>
        </div>
      </div>

      {/* Net Worth Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up stagger-1">
        <div className="glass-card rounded-2xl p-5 noise-overlay relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] to-transparent pointer-events-none rounded-2xl" />
          <div className="relative z-10">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Net Worth</p>
            <p className="text-3xl font-extrabold text-slate-50 tracking-tight">{formatCurrency(netWorth)}</p>
            <div className="flex items-center mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />+4.6%
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Total Assets</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalAssets)}</p>
          <p className="text-[11px] text-slate-600 mt-2">{accounts.filter(a => a.balance > 0).length} accounts</p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Total Liabilities</p>
          <p className="text-2xl font-bold text-rose-400">{formatCurrency(totalLiabilities)}</p>
          <p className="text-[11px] text-slate-600 mt-2">{accounts.filter(a => a.balance < 0).length} accounts</p>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((account, i) => {
          const Icon = account.icon;
          return (
            <div 
              key={account.id} 
              className="glass-card glass-card-hover rounded-2xl p-5 cursor-pointer group animate-fade-in-up"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${account.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: account.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors truncate max-w-[120px] sm:max-w-none">{account.name}</h3>
                      {account.isPlaidLinked && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <Link2 className="w-2.5 h-2.5" />
                          Plaid
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600">{account.institution}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-600 hover:text-slate-400 transition-all"><Eye className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-600 hover:text-slate-400 transition-all"><Copy className="w-3.5 h-3.5" /></button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingAccount(account); }}
                    className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-slate-600 hover:text-indigo-400 transition-all"
                    title="Edit account"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(account.id); }}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold mb-0.5">Balance</p>
                  <p className={`text-2xl font-extrabold tracking-tight font-mono ${account.convertedBalance >= 0 ? 'text-slate-50' : 'text-rose-400'}`}>
                    {formatCurrency(account.convertedBalance || account.balance)}
                  </p>
                  {account.currency && account.currency !== account.displayCurrency && (
                    <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                      Original: {account.balance.toLocaleString()} {account.currency}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    account.isPositive 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {account.isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                    {account.change}%
                  </span>
                  <p className="text-[10px] text-slate-700 mt-1 font-mono">•••• {account.last4}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConnectAccountModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddAccount}
      />

      <EditAccountModal
        isOpen={!!editingAccount}
        onClose={() => setEditingAccount(null)}
        onSubmit={handleEditSubmit}
        account={editingAccount}
      />
    </div>
  );
}
