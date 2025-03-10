import React, { useEffect, useState } from 'react';
import {
  Container,
  CssBaseline,
  Tab,
  Tabs,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Stack,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import zhCN from 'date-fns/locale/zh-CN';
import { UserManagement } from './components/UserManagement';
import { BetForm } from './components/BetForm';
import { BetList } from './components/BetList';
import { User } from './types/user';
import { Bet } from './types/bet';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const App = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bets, setBets] = useState<Bet[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchBets();
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

  const fetchBets = async () => {
    try {
      const response = await fetch(`${API_URL}/bets`);
      const data = await response.json();
      setBets(data);
    } catch (error) {
      console.error('Error fetching bets:', error);
    }
  };

  const handleCreateBet = async (bet: Omit<Bet, 'id' | 'status' | 'createdAt'>) => {
    try {
      const response = await fetch(`${API_URL}/bets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bet,
          status: 'pending',
        }),
      });
      if (response.ok) {
        fetchBets();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating bet:', error);
    }
  };

  const handleCompleteBet = async (betId: string, winnerId: string) => {
    try {
      const response = await fetch(`${API_URL}/bets/${betId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          winnerId,
        }),
      });
      if (response.ok) {
        fetchBets();
      }
    } catch (error) {
      console.error('Error completing bet:', error);
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
        fetchUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={(_, value) => setCurrentTab(value)}>
            <Tab label="对赌记录" />
            <Tab label="用户管理" />
          </Tabs>
        </Box>

        {currentTab === 0 && (
          <Box>
            <Stack direction="row" justifyContent="flex-end" mb={2}>
              <Button variant="contained" onClick={() => setIsDialogOpen(true)}>
                创建对赌
              </Button>
            </Stack>
            <BetList bets={bets} onComplete={handleCompleteBet} />
          </Box>
        )}

        {currentTab === 1 && (
          <UserManagement users={users} onUserAdded={handleCreateUser} />
        )}

        <BetForm
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSubmit={handleCreateBet}
          users={users}
        />
      </Container>
    </LocalizationProvider>
  );
};

export default App;
