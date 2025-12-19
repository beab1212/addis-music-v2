'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Ban, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';

export default function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { addToast } = useToastStore();
  const limit = 20;

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/users?page=${page}&limit=${limit}&q=${search}`);
      setUsers(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (error) {
      addToast('Failed to fetch users', 'error');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <Users size={32} className="text-orange-500" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Users Management</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              placeholder="Search users..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.image || '/icons8-google-48.png'} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                      <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {user.banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <Ban size={18} />
                      </button>
                      <button className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg">
                        <CheckCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50">Previous</button>
            <button disabled={page * limit >= total} onClick={() => setPage(page + 1)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50">Next</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
