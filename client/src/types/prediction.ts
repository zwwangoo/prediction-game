interface Participant {
  name: string;
  prediction: string;
}

export interface Prediction {
  id: string;
  title: string;
  description: string;
  amount: number;
  creator: Participant;
  opponent: Participant;
  status: 'pending' | 'completed';
  winner?: string;
  createdAt: string;
  dueDate: string;
} 