import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  FormHelperText,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { User } from '../types/user';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (bet: any) => void;
  users: User[];
}

export const PredictionForm: React.FC<Props> = ({ open, onClose, onSubmit, users }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [creator, setCreator] = useState('');
  const [creatorPrediction, setCreatorPrediction] = useState('');
  const [opponent, setOpponent] = useState('');
  const [opponentPrediction, setOpponentPrediction] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [predictionError, setPredictionError] = useState('');

  useEffect(() => {
    if (creatorPrediction && opponentPrediction && 
        creatorPrediction.trim().toLowerCase() === opponentPrediction.trim().toLowerCase()) {
      setPredictionError('创建者和对手的预测结果不能相同');
    } else {
      setPredictionError('');
    }
  }, [creatorPrediction, opponentPrediction]);

  useEffect(() => {
    if (creator && opponent && creator === opponent) {
      setOpponent('');
    }
  }, [creator, opponent]);

  useEffect(() => {
    if (creator && opponent && creator === opponent) {
      setCreator('');
    }
  }, [creator, opponent]);

  const handleSubmit = () => {
    if (predictionError) {
      return;
    }
    
    onSubmit({
      title,
      description,
      amount: parseFloat(amount),
      creator: {
        name: creator,
        prediction: creatorPrediction,
      },
      opponent: {
        name: opponent,
        prediction: opponentPrediction,
      },
      dueDate,
    });
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setAmount('');
    setCreator('');
    setCreatorPrediction('');
    setOpponent('');
    setOpponentPrediction('');
    setDueDate(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>新建预测挑战</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="描述"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            label="金额"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            required
            type="number"
            inputProps={{ min: "0", step: "0.01" }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>发起者</InputLabel>
              <Select
                value={creator}
                label="发起者"
                onChange={(e) => setCreator(e.target.value)}
              >
                {users
                  .filter(user => !opponent || user.name !== opponent)
                  .map((user) => (
                    <MenuItem key={user.id} value={user.name}>
                      {user.name}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            <TextField
              label="发起者预测"
              value={creatorPrediction}
              onChange={(e) => setCreatorPrediction(e.target.value)}
              fullWidth
              required
              error={!!predictionError}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>参与者</InputLabel>
              <Select
                value={opponent}
                label="参与者"
                onChange={(e) => setOpponent(e.target.value)}
              >
                {users
                  .filter(user => !creator || user.name !== creator)
                  .map((user) => (
                    <MenuItem key={user.id} value={user.name}>
                      {user.name}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            <TextField
              label="参与者预测"
              value={opponentPrediction}
              onChange={(e) => setOpponentPrediction(e.target.value)}
              fullWidth
              required
              error={!!predictionError}
            />
          </Box>
          {predictionError && (
            <FormHelperText error>{predictionError}</FormHelperText>
          )}
          <DateTimePicker
            label="截止时间"
            value={dueDate}
            onChange={(newValue) => setDueDate(newValue)}
            sx={{ width: '100%' }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={
            !title || 
            !amount || 
            !creator || 
            !creatorPrediction || 
            !opponent || 
            !opponentPrediction || 
            !!predictionError
          }
        >
          创建
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 