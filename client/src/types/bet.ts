export interface Bet {
  id: string;
  title: string;
  description?: string;
  amount: number;
  status: 'pending' | 'completed';
  winner?: string;
  createdAt: string;
  dueDate?: string;
  creator: {
    name: string;
    prediction: string;
  };
  opponent: {
    name: string;
    prediction: string;
  };
} 