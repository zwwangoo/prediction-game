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
  useTheme,
  useMediaQuery,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format, startOfMonth, endOfDay } from 'date-fns';
import zhCN from 'date-fns/locale/zh-CN';
import { User } from '../types/user';

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
  onUserAdded: (name: string) => Promise<boolean>;
}

export const UserManagement: React.FC<Props> = ({ users, onUserAdded }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [open, setOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState('');
  const [userStats, setUserStats] = useState<Record<string, UserStats>>({});
  const [startDate, setStartDate] = useState<Date | null>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date | null>(endOfDay(new Date()));

  // 使用useCallback包装fetchUserStats函数，避免不必要的重新创建
  const fetchUserStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/predictions`);
      const predictions = await response.json();
      
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

      // Calculate stats from all predictions
      predictions.forEach((prediction: any) => {
        const creatorName = prediction.creator.name;
        const opponentName = prediction.opponent.name;
        const amount = parseFloat(prediction.amount);

        // Update creator stats
        if (stats[creatorName] && !processedBets[creatorName].has(prediction.id)) {
          processedBets[creatorName].add(prediction.id);
          stats[creatorName].totalBets++;
          stats[creatorName].totalAmount += amount;
          
          if (prediction.status === 'completed') {
            stats[creatorName].completedBets++;
            if (prediction.winner === creatorName) {
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
        if (stats[opponentName] && !processedBets[opponentName].has(prediction.id)) {
          processedBets[opponentName].add(prediction.id);
          stats[opponentName].totalBets++;
          stats[opponentName].totalAmount += amount;
          
          if (prediction.status === 'completed') {
            stats[opponentName].completedBets++;
            if (prediction.winner === opponentName) {
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
  }, [fetchUserStats]);

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
      // 使用传入的onUserAdded函数添加用户
      const success = await onUserAdded(newUsername.trim());
      
      if (success) {
        // 添加用户成功后刷新用户统计信息
        fetchUserStats();
        handleClose();
      } else {
        throw new Error('创建用户失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建用户失败');
    }
  };

  // 添加排序后的用户列表计算
  const sortedUsers = users.slice().sort((a, b) => {
    const aNetAmount = userStats[a.name]?.netAmount || 0;
    const bNetAmount = userStats[b.name]?.netAmount || 0;
    return bNetAmount - aNetAmount; // 按照净收益降序排序
  });

  return (
    <Stack spacing={2}>
      <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} mb={2}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box display="flex" gap={2} flexDirection={isMobile ? 'column' : 'row'}>
              <DatePicker
                label="开始日期"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                maxDate={endDate || undefined}
                sx={{ 
                  width: isMobile ? '100%' : 200,
                  '& .MuiInputBase-root': {
                    height: 40,
                  },
                  '& .MuiInputBase-input': {
                    padding: '8px 14px',
                  }
                }}
                slotProps={{
                  textField: {
                    size: "small"
                  }
                }}
              />
              <DatePicker
                label="结束日期"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                minDate={startDate || undefined}
                maxDate={endOfDay(new Date())}
                sx={{ 
                  width: isMobile ? '100%' : 200,
                  '& .MuiInputBase-root': {
                    height: 40,
                  },
                  '& .MuiInputBase-input': {
                    padding: '8px 14px',
                  }
                }}
                slotProps={{
                  textField: {
                    size: "small"
                  }
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" gap={2} flexDirection={isMobile ? 'column' : 'row'} justifyContent={isMobile ? 'stretch' : 'flex-end'}>
              <Button 
                variant="outlined" 
                onClick={fetchUserStats}
                fullWidth={isMobile}
                size="small"
                sx={{ 
                  minWidth: isMobile ? '100%' : 100,
                  height: 40
                }}
              >
                刷新数据
              </Button>
              <Button 
                variant="contained" 
                onClick={() => setOpen(true)}
                fullWidth={isMobile}
                size="small"
                sx={{ 
                  minWidth: isMobile ? '100%' : 100,
                  height: 40
                }}
              >
                添加用户
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {sortedUsers.map((user) => (
        <Card key={user.id}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}>
                <Box sx={{ mb: isMobile ? 2 : 0 }}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {user.name}
                  </Typography>
                </Box>
              </Grid>

              {!isMobile && <Grid item xs={12} md={1}><Divider orientation="vertical" /></Grid>}
              {isMobile && <Grid item xs={12}><Divider /></Grid>}

              <Grid item xs={6} sm={6} md={2}>
                <Typography variant="body2" color="text.secondary">总参与/已完成</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  <span style={{ color: '#1976d2' }}>{userStats[user.name]?.totalBets || 0}</span>
                  /
                  <span style={{ color: '#424242' }}>{userStats[user.name]?.completedBets || 0}</span>
                </Typography>
              </Grid>

              <Grid item xs={6} sm={6} md={2}>
                <Typography variant="body2" color="text.secondary">胜/负</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  <span style={{ color: '#2e7d32' }}>{userStats[user.name]?.wonBets || 0}</span>
                  /
                  <span style={{ color: '#d32f2f' }}>{(userStats[user.name]?.completedBets || 0) - (userStats[user.name]?.wonBets || 0)}</span>
                </Typography>
              </Grid>

              <Grid item xs={6} sm={6} md={2}>
                <Typography variant="body2" color="text.secondary">总参与金额</Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                  ¥{(userStats[user.name]?.totalAmount || 0).toFixed(2)}
                </Typography>
              </Grid>

              <Grid item xs={6} sm={6} md={2}>
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
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
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
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">
            添加
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}; 