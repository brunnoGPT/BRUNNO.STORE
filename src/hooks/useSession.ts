import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useSession() {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      const recordSession = async () => {
        try {
          await addDoc(collection(db, 'sessions'), {
            userId: currentUser.uid,
            email: currentUser.email,
            timestamp: new Date(),
            ipAddress: 'Capturado pelo servidor',
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
          });
        } catch (error) {
          console.error('Erro ao registrar sessão:', error);
        }
      };

      recordSession();
    }
  }, [currentUser]);
}