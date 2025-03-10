import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Stack,
  Divider,
  LinearProgress,
} from '@mui/material';
import { format } from 'date-fns';
import zhCN from 'date-fns/locale/zh-CN';
import { Bet } from '../types/bet';

interface Props {
  bets: Bet[];
  onComplete: (betId: string, winnerId: string) => void;
}

export const BetList: React.FC<Props> = ({ bets, onComplete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'pending':
        return '进行中';
      default:
        return status;
    }
  };

  return (
    <Stack spacing={2}>
      {bets.map((bet) => (
        <Card key={bet.id} sx={{ width: '100%' }}>
          <CardContent>
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center" sx={{ width: '100%' }}>
                  <Typography 
                    variant="h6" 
                    component="div" 
                    sx={{ 
                      fontWeight: 'bold',
                      flex: 1,
                      mr: 2
                    }}
                  >
                    {bet.title}
                  </Typography>
                  {bet.status !== 'completed' && (
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 'bold',
                        width: '120px',
                        textAlign: 'right',
                        mr: 2,
                        color: '#f50057'
                      }}
                    >
                      ¥{bet.amount.toFixed(2)}
                    </Typography>
                  )}
                </Box>
                <Chip
                  label={getStatusText(bet.status)}
                  sx={{ 
                    fontWeight: 'medium',
                    bgcolor: bet.status === 'completed' ? '#424242' : '#ed6c02',
                    color: '#fff',
                    minWidth: '80px',
                    textAlign: 'center'
                  }}
                />
              </Box>
              {bet.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {bet.description}
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ position: 'relative', height: '40px', mb: 2 }}>
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: 1,
                  display: 'flex',
                }}
              >
                <Box
                  sx={{
                    width: '50%',
                    height: '100%',
                    bgcolor: bet.status === 'completed' ? 
                      (bet.winner === bet.creator.name ? '#e3f2fd' : '#f5f5f5') : 
                      '#f5f5f5',
                    transition: 'all 0.3s ease-in-out',
                    transform: bet.status === 'completed' && bet.winner === bet.creator.name ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: bet.status === 'completed' && bet.winner === bet.creator.name ? '0 2px 8px rgba(25, 118, 210, 0.2)' : 'none',
                  }}
                />
                <Box
                  sx={{
                    width: '50%',
                    height: '100%',
                    bgcolor: bet.status === 'completed' ? 
                      (bet.winner === bet.opponent.name ? '#e8f5e9' : '#f5f5f5') : 
                      '#f5f5f5',
                    transition: 'all 0.3s ease-in-out',
                    transform: bet.status === 'completed' && bet.winner === bet.opponent.name ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: bet.status === 'completed' && bet.winner === bet.opponent.name ? '0 2px 8px rgba(46, 125, 50, 0.2)' : 'none',
                  }}
                />
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 'bold',
                        color: bet.status === 'completed' ? 
                          (bet.winner === bet.creator.name ? '#1976d2' : '#757575') : 
                          '#757575',
                      }}
                    >
                      {bet.creator.prediction}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: bet.status === 'completed' ? 
                          (bet.winner === bet.creator.name ? '#1976d2' : '#757575') : 
                          '#757575',
                      }}
                    >
                      ({bet.creator.name})
                    </Typography>
                    {bet.status === 'completed' && (
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: bet.winner === bet.creator.name ? '#1976d2' : '#d32f2f',
                          ml: 1,
                          animation: 'fadeIn 0.5s ease-in-out'
                        }}
                      >
                        {bet.winner === bet.creator.name ? '+' : '-'}¥{bet.amount.toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                  {bet.status === 'completed' && bet.winner === bet.creator.name && (
                    <Chip
                      label="胜"
                      size="small"
                      sx={{ 
                        ml: 1,
                        bgcolor: '#1976d2',
                        color: '#ffffff',
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    px: 2,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {bet.status === 'completed' && (
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: bet.winner === bet.opponent.name ? '#2e7d32' : '#d32f2f',
                          mr: 1,
                          animation: 'fadeIn 0.5s ease-in-out'
                        }}
                      >
                        {bet.winner === bet.opponent.name ? '+' : '-'}¥{bet.amount.toFixed(2)}
                      </Typography>
                    )}
                    <Typography
                      sx={{
                        fontWeight: 'bold',
                        color: bet.status === 'completed' ? 
                          (bet.winner === bet.opponent.name ? '#2e7d32' : '#757575') : 
                          '#757575',
                      }}
                    >
                      {bet.opponent.prediction}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: bet.status === 'completed' ? 
                          (bet.winner === bet.opponent.name ? '#2e7d32' : '#757575') : 
                          '#757575',
                      }}
                    >
                      ({bet.opponent.name})
                    </Typography>
                  </Box>
                  {bet.status === 'completed' && bet.winner === bet.opponent.name && (
                    <Chip
                      label="胜"
                      size="small"
                      sx={{ 
                        ml: 1,
                        bgcolor: '#2e7d32',
                        color: '#ffffff',
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                创建时间：{format(new Date(bet.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
              </Typography>
              {bet.dueDate && (
                <Typography variant="body2" color="text.secondary">
                  截止时间：{format(new Date(bet.dueDate), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                </Typography>
              )}
            </Box>

            {bet.status === 'pending' && (
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => onComplete(bet.id, bet.creator.name)}
                  fullWidth
                  sx={{ 
                    bgcolor: '#1976d2',
                    '&:hover': {
                      bgcolor: '#1565c0'
                    }
                  }}
                >
                  {bet.creator.name} 胜出
                </Button>
                <Button
                  variant="contained"
                  onClick={() => onComplete(bet.id, bet.opponent.name)}
                  fullWidth
                  sx={{ 
                    bgcolor: '#2e7d32',
                    '&:hover': {
                      bgcolor: '#1b5e20'
                    }
                  }}
                >
                  {bet.opponent.name} 胜出
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}; 