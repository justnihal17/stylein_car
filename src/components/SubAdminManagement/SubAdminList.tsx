
import { useState } from 'react';
import { Search, Plus, Download, Eye, EyeOff, Copy, Trash2, Edit2, Shield, UserX, UserCheck, ChevronRight, Settings } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { CreateSubAdminDrawer } from './CreateSubAdminDrawer';

interface SubAdmin {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  password: 'password123';
  status: 'Active' | 'Inactive' | 'Blocked';
  created: string;
  lastLogin: string;
}

const DUMMY_DATA: SubAdmin[] = [
  { id: '1', name: 'John Doe', username: 'john.doe', email: 'john@cafu.com', phone: '+1234567890', role: 'Super Admin', department: 'Operations', password: 'password123', status: 'Active', created: '2026-01-15', lastLogin: '2026-07-17 10:00' },
  { id: '2', name: 'Jane Smith', username: 'jane.smith', email: 'jane@cafu.com', phone: '+1987654321', role: 'Staff', department: 'Marketing', password: 'password123', status: 'Inactive', created: '2026-02-20', lastLogin: '2026-07-15 08:30' },
];

export function SubAdminManagement() {
  const [data, setData] = useState<SubAdmin[]>(DUMMY_DATA);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('Overview');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedAdmin, setSelectedAdmin] = useState<SubAdmin | null>(null);

  const togglePassword = (id: string) => setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));

  const handleCreate = () => { setDrawerMode('create'); setSelectedAdmin(null); setIsDrawerOpen(true); };
  const handleEdit = (admin: SubAdmin) => { setDrawerMode('edit'); setSelectedAdmin(admin); setIsDrawerOpen(true); };
  const handleView = (admin: SubAdmin) => { setDrawerMode('view'); setSelectedAdmin(admin); setIsDrawerOpen(true); };
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      setData(data.filter(a => a.id !== id));
    }
  };

  const handleSave = (admin: SubAdmin) => {
    if (drawerMode === 'create') {
      setData([...data, { ...admin, id: String(data.length + 1) }]);
    } else {
      setData(data.map(a => a.id === admin.id ? admin : a));
    }
    setIsDrawerOpen(false);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span>Dashboard</span> <ChevronRight className="w-4 h-4" /> <span>Profile Management</span> <ChevronRight className="w-4 h-4" /> <span className="font-semibold text-blue-600">Sub Admin</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">SUB ADMIN MANAGEMENT</h2>
          <p className="text-slate-600 mt-1">Manage all administrators and access permissions.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">
            <Plus className="w-4 h-4" /> Create Sub Admin
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-6 gap-4">
        {[
          { label: 'Total Admins', value: '12' },
          { label: 'Active', value: '8' },
          { label: 'Inactive', value: '3' },
          { label: 'Blocked', value: '1' },
          { label: 'Today\'s Login', value: '5' },
          { label: 'Pending Approval', value: '2' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-slate-200">
        {['Overview', 'Staff', 'Roles', 'Permissions', 'Activity Logs'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 font-medium text-sm ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' ? (
        <>
            {/* Recent Admins */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Recent Admins</h3>
                <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Username</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Password</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.map(admin => (
                    <tr key={admin.id} className="hover:bg-slate-50">
                        <td className="p-4 font-medium text-slate-900">{admin.name}</td>
                        <td className="p-4 text-slate-600">{admin.username}</td>
                        <td className="p-4 text-slate-600">{admin.email}</td>
                        <td className="p-4 text-slate-600">{admin.role}</td>
                        <td className="p-4 flex items-center gap-2">
                        {showPasswords[admin.id] ? admin.password : '********'}
                        <button onClick={() => togglePassword(admin.id)} className="text-slate-400 hover:text-blue-600">{showPasswords[admin.id] ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button>
                        <button className="text-slate-400 hover:text-blue-600"><Copy className="w-4 h-4"/></button>
                        </td>
                        <td className="p-4"><StatusBadge status={admin.status} /></td>
                        <td className="p-4 flex gap-2">
                        <button onClick={() => handleView(admin)} className="text-blue-600 hover:text-blue-800"><Eye className="w-4 h-4"/></button>
                        <button onClick={() => handleEdit(admin)} className="text-blue-600 hover:text-blue-800"><Edit2 className="w-4 h-4"/></button>
                        <button onClick={() => handleDelete(admin.id, admin.name)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4"/></button>
                        {admin.status === 'Active' ? <button className="text-slate-600 hover:text-slate-900"><UserX className="w-4 h-4"/></button> : <button className="text-emerald-600 hover:text-emerald-900"><UserCheck className="w-4 h-4"/></button>}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </>
      ) : (
        <div className="p-12 text-center text-slate-500">
            {activeTab} module is under development.
        </div>
      )}

      {isDrawerOpen && <CreateSubAdminDrawer mode={drawerMode} admin={selectedAdmin} onSave={handleSave} onClose={() => setIsDrawerOpen(false)} />}
    </div>
  );
}
