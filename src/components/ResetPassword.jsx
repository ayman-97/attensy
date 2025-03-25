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

const ResetPassword = ({ open, email, onClose }) => {
  const { resetPassword } = useAuth();
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    // التحقق من صحة المدخلات
    if (!resetCode || !newPassword || !confirmPassword) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    if (resetCode.length !== 6) {
      setError('رمز التحقق يجب أن يكون 6 أرقام');
      return;
    }

    if (newPassword.length < 6) {
      setError('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);
    setError('');
    
    const result = await resetPassword(email, resetCode, newPassword);
    
    setLoading(false);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => onClose(true), 3000);
    } else {
      setError(result.error);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => onClose(false)} 
      maxWidth="xs" 
      fullWidth
      aria-labelledby="reset-password-title"
    >
      <DialogTitle 
        id="reset-password-title"
        sx={{ textAlign: 'center' }}
      >
        إعادة تعيين كلمة المرور
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Typography>
            تم إرسال رمز التحقق إلى بريدك الإلكتروني:
            <br />
            <strong>{email}</strong>
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success">
              تم تغيير كلمة المرور بنجاح
            </Alert>
          )}

          <TextField
            label="رمز التحقق"
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
            fullWidth
            placeholder="أدخل الرمز المكون من 6 أرقام"
            inputProps={{ maxLength: 6 }}
            disabled={loading || success}
            error={!!error}
            autoFocus
          />

          <TextField
            label="كلمة المرور الجديدة"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            disabled={loading || success}
            error={!!error}
          />

          <TextField
            label="تأكيد كلمة المرور"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            disabled={loading || success}
            error={!!error}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => onClose(false)}
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
          {loading ? <CircularProgress size={24} /> : 'تغيير كلمة المرور'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResetPassword;
