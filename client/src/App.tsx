import React, { useEffect, useState } from 'react';
import {
  Container,
  CssBaseline,
  Tab,
  Tabs,
  Box,
  Button,
  Stack,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import zhCN from 'date-fns/locale/zh-CN';
import { UserManagement } from './components/UserManagement';
import { PredictionForm } from './components/PredictionForm';
import { PredictionList } from './components/PredictionList';
import { User } from './types/user';
import { Prediction } from './types/prediction';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const App = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchPredictions();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPredictions = async () => {
    try {
      const response = await fetch(`${API_URL}/predictions`);
      const data = await response.json();
      setPredictions(data);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const handleCreatePrediction = async (prediction: Omit<Prediction, 'id' | 'status' | 'createdAt'>) => {
    try {
      const response = await fetch(`${API_URL}/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...prediction,
          status: 'pending',
        }),
      });
      if (response.ok) {
        fetchPredictions();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating prediction:', error);
    }
  };

  const handleCompletePrediction = async (predictionId: string, winnerId: string) => {
    try {
      const response = await fetch(`${API_URL}/predictions/${predictionId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          winnerId,
        }),
      });
      if (response.ok) {
        fetchPredictions();
      }
    } catch (error) {
      console.error('Error completing prediction:', error);
    }
  };

  const handleCreateUser = async (name: string) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      if (response.ok) {
        await fetchUsers();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  };

  return (
    <LocalizationProvider 
      dateAdapter={AdapterDateFns} 
      adapterLocale={zhCN}
      dateFormats={{ 
        year: 'yyyy',
        month: 'yyyy-MM',
        dayOfMonth: 'dd',
        fullDate: 'yyyy-MM-dd',
        fullDateTime: 'yyyy-MM-dd HH:mm:ss',
      }}
    >
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={(_, value) => setCurrentTab(value)}>
            <Tab label="预测记录" />
            <Tab label="用户管理" />
          </Tabs>
        </Box>

        {currentTab === 0 && (
          <Box>
            <Stack direction="row" justifyContent="flex-start" mb={2}>
              <Button variant="contained" onClick={() => setIsDialogOpen(true)}>
                创建预测
              </Button>
            </Stack>
            <PredictionList predictions={predictions} onComplete={handleCompletePrediction} />
          </Box>
        )}

        {currentTab === 1 && (
          <UserManagement users={users} onUserAdded={handleCreateUser} />
        )}

        <PredictionForm
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSubmit={handleCreatePrediction}
          users={users}
        />
      </Container>
    </LocalizationProvider>
  );
};

export default App;
