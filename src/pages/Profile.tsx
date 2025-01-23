import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Activity, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SessionData {
  timestamp: Timestamp;
  platform: string;
  userAgent: string;
}

function Profile() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    async function fetchSessions() {
      try {
        const sessionsRef = collection(db, 'sessions');
        const q = query(
          sessionsRef,
          where('userId', '==', currentUser.uid),
          orderBy('timestamp', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const sessionData = querySnapshot.docs.map(doc => ({
          timestamp: doc.data().timestamp,
          platform: doc.data().platform,
          userAgent: doc.data().userAgent
        }));
        setSessions(sessionData);
      } catch (error) {
        console.error('Erro ao buscar sessões:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          {/* Header/Cover */}
          <div className="h-32 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-800 dark:to-blue-800" />
          
          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center -mt-12">
              <div className="relative">
                <div className="w-24 h-24 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              </div>
              <div className="mt-6 sm:mt-0 sm:ml-6 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentUser.email}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Membro desde {new Date(currentUser.metadata.creationTime!).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-6 sm:mt-0 sm:ml-auto flex space-x-3">
                <button
                  onClick={() => navigate('/settings')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">
                    Total de Acessos
                  </h3>
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {sessions.length}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">
                    Último Acesso
                  </h3>
                </div>
                <p className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                  {sessions[0]?.timestamp?.toDate().toLocaleString() || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Atividade Recente
              </h3>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
                ) : sessions.length > 0 ? (
                  sessions.slice(0, 5).map((session, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Acesso ao sistema
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {session.platform} - {session.userAgent}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {session.timestamp.toDate().toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhuma atividade recente encontrada.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;