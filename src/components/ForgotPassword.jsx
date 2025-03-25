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

const ForgotPassword = ({ open, onClose }) => {
  const { sendPasswordResetEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async () => {
    try {
      if (!email.trim()) {
        setError('يرجى إدخال البريد الإلكتروني');
        return;
      }

      if (!validateEmail(email)) {
        setError('يرجى إدخال بريد إلكتروني صحيح');
        return;
      }

      setLoading(true);
      setError('');
      setSuccess(false);
      
      console.log('Sending password reset email to:', email);
      const result = await sendPasswordResetEmail(email);
      console.log('Password reset result:', result);
      
      setLoading(false);
      
      if (result.success) {
        setSuccess(true);
        // إغلاق النافذة بعد 3 ثوانٍ من نجاح العملية
        setTimeout(() => onClose(true, email), 3000);
      } else {
        setError(result.error || 'حدث خطأ في إرسال رمز إعادة تعيين كلمة المرور');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setLoading(false);
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    setLoading(false);
    onClose(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="xs" 
      fullWidth
      aria-labelledby="forgot-password-title"
    >
      <DialogTitle 
        id="forgot-password-title"
        sx={{ textAlign: 'center' }}
      >
        استعادة كلمة المرور
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Typography>
            أدخل بريدك الإلكتروني وسنرسل لك رمز إعادة تعيين كلمة المرور
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success">
              تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني
            </Alert>
          )}

          <TextField
            label="البريد الإلكتروني"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            disabled={loading || success}
            error={!!error}
            autoFocus
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose}
          disabled={loading}
          color="inherit"
        >
          إلغاء
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || success}
          variant="contained"
          color="primary"
        >
          {loading ? <CircularProgress size={24} /> : 'إرسال'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPassword;
