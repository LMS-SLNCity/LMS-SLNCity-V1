import React from 'react';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { MainLayout } from './components/MainLayout';


const AppContent: React.FC = () => {
    const { user } = useAuth();
    
    if (!user) {
        return <LoginScreen />;
    }

    return <MainLayout user={user} />;
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AppProvider>
  );
};

export default App;