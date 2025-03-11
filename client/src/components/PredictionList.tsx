import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { format } from 'date-fns';
import zhCN from 'date-fns/locale/zh-CN';
import { Prediction } from '../types/prediction';

interface Props {
  predictions: Prediction[];
  onComplete: (predictionId: string, winnerId: string) => void;
}

export const PredictionList: React.FC<Props> = ({ predictions, onComplete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      {predictions.map((prediction) => (
        <Card key={prediction.id} sx={{ width: '100%' }}>
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
                    {prediction.title}
                  </Typography>
                  {prediction.status !== 'completed' && (
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
                      ¥{prediction.amount.toFixed(2)}
                    </Typography>
                  )}
                </Box>
                <Chip
                  label={getStatusText(prediction.status)}
                  sx={{ 
                    fontWeight: 'medium',
                    bgcolor: prediction.status === 'completed' ? '#424242' : '#ed6c02',
                    color: '#fff',
                    minWidth: '80px',
                    textAlign: 'center'
                  }}
                />
              </Box>
              {prediction.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {prediction.description}
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ position: 'relative', height: isMobile ? '80px' : '40px', mb: 2 }}>
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                }}
              >
                <Box
                  sx={{
                    width: isMobile ? '100%' : '50%',
                    height: isMobile ? '50%' : '100%',
                    bgcolor: prediction.status === 'completed' ? 
                      (prediction.winner === prediction.creator.name ? '#e3f2fd' : '#f5f5f5') : 
                      '#f5f5f5',
                    transition: 'all 0.3s ease-in-out',
                    transform: prediction.status === 'completed' && prediction.winner === prediction.creator.name ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: prediction.status === 'completed' && prediction.winner === prediction.creator.name ? '0 2px 8px rgba(25, 118, 210, 0.2)' : 'none',
                  }}
                />
                <Box
                  sx={{
                    width: isMobile ? '100%' : '50%',
                    height: isMobile ? '50%' : '100%',
                    bgcolor: prediction.status === 'completed' ? 
                      (prediction.winner === prediction.opponent.name ? '#e8f5e9' : '#f5f5f5') : 
                      '#f5f5f5',
                    transition: 'all 0.3s ease-in-out',
                    transform: prediction.status === 'completed' && prediction.winner === prediction.opponent.name ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: prediction.status === 'completed' && prediction.winner === prediction.opponent.name ? '0 2px 8px rgba(46, 125, 50, 0.2)' : 'none',
                  }}
                />
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    width: '100%',
                    height: isMobile ? '50%' : '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isMobile ? 'flex-start' : 'flex-start',
                    px: 2,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    flexWrap: 'wrap',
                    justifyContent: isMobile ? 'flex-start' : 'flex-start',
                    width: '100%',
                  }}>
                    <Typography
                      sx={{
                        fontWeight: 'bold',
                        color: prediction.status === 'completed' ? 
                          (prediction.winner === prediction.creator.name ? '#1976d2' : '#757575') : 
                          '#757575',
                        mr: 1,
                      }}
                    >
                      {prediction.creator.prediction}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: prediction.status === 'completed' ? 
                          (prediction.winner === prediction.creator.name ? '#1976d2' : '#757575') : 
                          '#757575',
                        mr: isMobile ? 'auto' : 1,
                      }}
                    >
                      ({prediction.creator.name})
                    </Typography>
                    {prediction.status === 'completed' && (
                      <>
                        {isMobile && prediction.winner === prediction.creator.name && (
                          <Chip
                            label="胜"
                            size="small"
                            sx={{ 
                              mr: 1,
                              bgcolor: '#1976d2',
                              color: '#ffffff',
                              fontWeight: 'bold',
                            }}
                          />
                        )}
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: prediction.winner === prediction.creator.name ? '#1976d2' : '#d32f2f',
                            animation: 'fadeIn 0.5s ease-in-out'
                          }}
                        >
                          {prediction.winner === prediction.creator.name ? '+' : '-'}¥{prediction.amount.toFixed(2)}
                        </Typography>
                        {!isMobile && prediction.winner === prediction.creator.name && (
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
                      </>
                    )}
                  </Box>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    width: '100%',
                    height: isMobile ? '50%' : '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isMobile ? 'flex-start' : 'flex-end',
                    px: 2,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    flexWrap: 'wrap',
                    justifyContent: isMobile ? 'flex-start' : 'flex-end',
                    width: '100%',
                  }}>
                    {!isMobile && prediction.status === 'completed' && (
                      <>
                        {prediction.winner === prediction.opponent.name && (
                          <Chip
                            label="胜"
                            size="small"
                            sx={{ 
                              mr: 1,
                              bgcolor: '#2e7d32',
                              color: '#ffffff',
                              fontWeight: 'bold',
                            }}
                          />
                        )}
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: prediction.winner === prediction.opponent.name ? '#2e7d32' : '#d32f2f',
                            animation: 'fadeIn 0.5s ease-in-out',
                            mr: 1
                          }}
                        >
                          {prediction.winner === prediction.opponent.name ? '+' : '-'}¥{prediction.amount.toFixed(2)}
                        </Typography>
                      </>
                    )}
                    <Typography
                      sx={{
                        fontWeight: 'bold',
                        color: prediction.status === 'completed' ? 
                          (prediction.winner === prediction.opponent.name ? '#2e7d32' : '#757575') : 
                          '#757575',
                        mr: 1,
                      }}
                    >
                      {prediction.opponent.prediction}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: prediction.status === 'completed' ? 
                          (prediction.winner === prediction.opponent.name ? '#2e7d32' : '#757575') : 
                          '#757575',
                        mr: isMobile ? 'auto' : 0,
                      }}
                    >
                      ({prediction.opponent.name})
                    </Typography>
                    {isMobile && prediction.status === 'completed' && (
                      <>
                        {prediction.winner === prediction.opponent.name && (
                          <Chip
                            label="胜"
                            size="small"
                            sx={{ 
                              mr: 1,
                              bgcolor: '#2e7d32',
                              color: '#ffffff',
                              fontWeight: 'bold',
                            }}
                          />
                        )}
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: prediction.winner === prediction.opponent.name ? '#2e7d32' : '#d32f2f',
                            animation: 'fadeIn 0.5s ease-in-out'
                          }}
                        >
                          {prediction.winner === prediction.opponent.name ? '+' : '-'}¥{prediction.amount.toFixed(2)}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                创建时间：{format(new Date(prediction.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
              </Typography>
              {prediction.dueDate && (
                <Typography variant="body2" color="text.secondary">
                  截止时间：{format(new Date(prediction.dueDate), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                </Typography>
              )}
            </Box>

            {prediction.status === 'pending' && (
              <Stack 
                direction={isMobile ? 'column' : 'row'} 
                spacing={2} 
                sx={{ mt: 2 }}
              >
                <Button
                  variant="contained"
                  onClick={() => onComplete(prediction.id, prediction.creator.name)}
                  fullWidth
                  sx={{ 
                    bgcolor: '#1976d2',
                    '&:hover': {
                      bgcolor: '#1565c0'
                    }
                  }}
                >
                  {prediction.creator.name} 胜出
                </Button>
                <Button
                  variant="contained"
                  onClick={() => onComplete(prediction.id, prediction.opponent.name)}
                  fullWidth
                  sx={{ 
                    bgcolor: '#2e7d32',
                    '&:hover': {
                      bgcolor: '#1b5e20'
                    }
                  }}
                >
                  {prediction.opponent.name} 胜出
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}; 