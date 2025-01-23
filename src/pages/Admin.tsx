import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Activity, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface UserSession {
  id: string;
  userId: string;
  email: string;
  timestamp: Timestamp;
  ipAddress: string;
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: string;
}

function Admin() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser?.email?.includes('admin')) {
      navigate('/');
      return;
    }

    const q = query(
      collection(db, 'sessions'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessionData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserSession));
      setSessions(sessionData);
    });

    return () => unsubscribe();
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Painel Administrativo
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                Total de Sessões
              </h2>
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
              {sessions.length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                Usuários Únicos
              </h2>
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
              {new Set(sessions.map(s => s.userId)).size}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                Última Atividade
              </h2>
            </div>
            <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              {sessions[0]?.timestamp.toDate().toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sessões de Usuários
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    IP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Navegador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Data/Hora
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{session.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{session.ipAddress}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {session.userAgent}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {session.platform} - {session.screenResolution}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {session.timestamp.toDate().toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;