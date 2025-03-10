import React, { useState } from 'react';
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
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { User } from '../types/user';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (bet: any) => void;
  users: User[];
}

export const BetForm: React.FC<Props> = ({ open, onClose, onSubmit, users }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [creator, setCreator] = useState('');
  const [creatorPrediction, setCreatorPrediction] = useState('');
  const [opponent, setOpponent] = useState('');
  const [opponentPrediction, setOpponentPrediction] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const handleSubmit = () => {
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
      <DialogTitle>新建对赌</DialogTitle>
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
              <InputLabel>创建者</InputLabel>
              <Select
                value={creator}
                label="创建者"
                onChange={(e) => setCreator(e.target.value)}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.name}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="创建者预测"
              value={creatorPrediction}
              onChange={(e) => setCreatorPrediction(e.target.value)}
              fullWidth
              required
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>对手</InputLabel>
              <Select
                value={opponent}
                label="对手"
                onChange={(e) => setOpponent(e.target.value)}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.name}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="对手预测"
              value={opponentPrediction}
              onChange={(e) => setOpponentPrediction(e.target.value)}
              fullWidth
              required
            />
          </Box>
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
          disabled={!title || !amount || !creator || !creatorPrediction || !opponent || !opponentPrediction}
        >
          创建
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 