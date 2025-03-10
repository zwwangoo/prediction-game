import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import { DateTimePicker, DatePicker } from '@mui/x-date-pickers';
import { format, startOfMonth, endOfDay } from 'date-fns';
import zhCN from 'date-fns/locale/zh-CN';
import { User } from '../types/user';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface UserStats {
  totalBets: number;      // 总参与场次（包括进行中的）
  completedBets: number;  // 已完成场次
  wonBets: number;        // 胜利场次
  totalAmount: number;    // 总参与金额
  wonAmount: number;      // 赢得金额
  lostAmount: number;     // 损失金额
  netAmount: number;      // 净收益
}

interface Props {
  users: User[];
  onUserAdded: (name: string) => void;
}

export const UserManagement: React.FC<Props> = ({ users, onUserAdded }) => {
  const [open, setOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState('');
  const [userStats, setUserStats] = useState<Record<string, UserStats>>({});
  const [startDate, setStartDate] = useState<Date | null>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date | null>(endOfDay(new Date()));

  // 使用useCallback包装fetchUserStats函数，避免不必要的重新创建
  const fetchUserStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/bets`);
      const bets = await response.json();
      
      const stats: Record<string, UserStats> = {};
      
      // Initialize stats for all users
      users.forEach(user => {
        stats[user.name] = {
          totalBets: 0,
          completedBets: 0,
          wonBets: 0,
          totalAmount: 0,
          wonAmount: 0,
          lostAmount: 0,
          netAmount: 0,
        };
      });

      // 用于跟踪每个用户已经计算过的对赌ID
      const processedBets: Record<string, Set<string>> = {};
      users.forEach(user => {
        processedBets[user.name] = new Set();
      });

      // Calculate stats from all bets, ignoring date filters
      bets.forEach((bet: any) => {
        const creatorName = bet.creator.name;
        const opponentName = bet.opponent.name;
        const amount = parseFloat(bet.amount);

        // Update creator stats
        if (stats[creatorName] && !processedBets[creatorName].has(bet.id)) {
          processedBets[creatorName].add(bet.id);
          stats[creatorName].totalBets++;
          stats[creatorName].totalAmount += amount;
          
          if (bet.status === 'completed') {
            stats[creatorName].completedBets++;
            if (bet.winner === creatorName) {
              stats[creatorName].wonBets++;
              stats[creatorName].wonAmount += amount;
              stats[creatorName].netAmount += amount;
            } else {
              stats[creatorName].lostAmount += amount;
              stats[creatorName].netAmount -= amount;
            }
          }
        }

        // Update opponent stats
        if (stats[opponentName] && !processedBets[opponentName].has(bet.id)) {
          processedBets[opponentName].add(bet.id);
          stats[opponentName].totalBets++;
          stats[opponentName].totalAmount += amount;
          
          if (bet.status === 'completed') {
            stats[opponentName].completedBets++;
            if (bet.winner === opponentName) {
              stats[opponentName].wonBets++;
              stats[opponentName].wonAmount += amount;
              stats[opponentName].netAmount += amount;
            } else {
              stats[opponentName].lostAmount += amount;
              stats[opponentName].netAmount -= amount;
            }
          }
        }
      });

      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  }, [users]); // 依赖于users数组

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]); // 依赖于fetchUserStats函数

  const handleClose = () => {
    setOpen(false);
    setNewUsername('');
    setError('');
  };

  const handleSubmit = async () => {
    if (!newUsername.trim()) {
      setError('用户名不能为空');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newUsername.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '创建用户失败');
      }

      onUserAdded(newUsername.trim());
      // 添加用户后刷新用户统计信息
      setTimeout(() => {
        fetchUserStats();
      }, 500); // 添加一个小延迟，确保服务器有时间处理请求
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建用户失败');
    }
  };

  return (
    <Stack spacing={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" gap={2}>
          <DatePicker
            label="开始日期"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            maxDate={endDate || undefined}
            sx={{ width: 240 }}
          />
          <DatePicker
            label="结束日期"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            minDate={startDate || undefined}
            maxDate={endOfDay(new Date())}
            sx={{ width: 240 }}
          />
          <Button 
            variant="outlined" 
            onClick={fetchUserStats}
          >
            刷新数据
          </Button>
        </Box>
        <Button 
          variant="contained" 
          onClick={() => setOpen(true)}
        >
          添加用户
        </Button>
      </Box>

      {users.map((user) => (
        <Card key={user.id}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  创建时间：{format(new Date(user.created_at), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem />

              <Box>
                <Typography variant="body2" color="text.secondary">总参与/已完成</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  <span style={{ color: '#1976d2' }}>{userStats[user.name]?.totalBets || 0}</span>
                  /
                  <span style={{ color: '#424242' }}>{userStats[user.name]?.completedBets || 0}</span>
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">胜/负</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  <span style={{ color: '#2e7d32' }}>{userStats[user.name]?.wonBets || 0}</span>
                  /
                  <span style={{ color: '#d32f2f' }}>{(userStats[user.name]?.completedBets || 0) - (userStats[user.name]?.wonBets || 0)}</span>
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">总参与金额</Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                  ¥{(userStats[user.name]?.totalAmount || 0).toFixed(2)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">净收益</Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: (userStats[user.name]?.netAmount || 0) > 0 ? '#2e7d32' : 
                           (userStats[user.name]?.netAmount || 0) < 0 ? '#d32f2f' : 'text.primary'
                  }}
                >
                  {(userStats[user.name]?.netAmount || 0) > 0 ? '+' : ''}
                  ¥{(userStats[user.name]?.netAmount || 0).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>添加新用户</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="用户名"
            fullWidth
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            error={!!error}
            helperText={error}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">
            添加
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}; 