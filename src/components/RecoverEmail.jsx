import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const RecoverEmail = ({ open, onClose }) => {
  const { recoverEmail } = useAuth();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError('يرجى إدخال اسم المستخدم');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    
    const result = await recoverEmail(username);
    
    setLoading(false);
    
    if (result.success) {
      setSuccess(true);
      // إغلاق النافذة بعد 3 ثوانٍ من نجاح العملية
      setTimeout(() => onClose(), 3000);
    } else {
      setError(result.error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center' }}>
        استرداد البريد الإلكتروني
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Typography>
            أدخل اسم المستخدم الخاص بك وسنرسل لك بريدك الإلكتروني المسجل
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success">
              تم إرسال البريد الإلكتروني المسجل إلى عنوانك
            </Alert>
          )}

          <TextField
            label="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            disabled={loading || success}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || success}
          fullWidth
          sx={{ mx: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'استرداد البريد الإلكتروني'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecoverEmail;
