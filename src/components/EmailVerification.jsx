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

const EmailVerification = ({ open, email, onClose }) => {
  const { verifyEmail, resendVerificationCode } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError('يرجى إدخال رمز التحقق');
      return;
    }

    setLoading(true);
    setError('');
    
    const result = await verifyEmail(email, verificationCode);
    
    setLoading(false);
    
    if (result.success) {
      onClose(true);
    } else {
      setError(result.error);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    setResendSuccess(false);

    const result = await resendVerificationCode(email);

    setResendLoading(false);

    if (result.success) {
      setResendSuccess(true);
    } else {
      setError(result.error);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center' }}>
        تأكيد البريد الإلكتروني
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
          
          {resendSuccess && (
            <Alert severity="success">
              تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني
            </Alert>
          )}

          <TextField
            label="رمز التحقق"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            fullWidth
            placeholder="أدخل الرمز المكون من 6 أرقام"
            inputProps={{ maxLength: 6 }}
          />

          <Button
            variant="text"
            onClick={handleResend}
            disabled={resendLoading}
          >
            {resendLoading ? (
              <CircularProgress size={24} />
            ) : (
              'إعادة إرسال رمز التحقق'
            )}
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button
          variant="contained"
          onClick={handleVerify}
          disabled={loading}
          fullWidth
          sx={{ mx: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'تأكيد'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailVerification;
