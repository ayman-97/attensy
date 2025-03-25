// src/components/AuthForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Container,
  Paper,
  Tabs,
  Tab,
  Stack,
  FormControlLabel,
  Checkbox,
  Alert,
  Typography,
  InputAdornment,
  IconButton,
  Link,
  Box
} from '@mui/material';
import {
  AccountCircle,
  Lock,
  Email,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import EmailVerification from './EmailVerification';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

const AuthForm = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      // التحقق من صحة البيانات عند التسجيل
      if (!formData.username.trim()) {
        setError('يرجى إدخال اسم المستخدم');
        return;
      }
      if (!validateEmail(formData.email)) {
        setError('يرجى إدخال بريد إلكتروني صحيح');
        return;
      }
      if (formData.password.length < 6) {
        setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('كلمات المرور غير متطابقة');
        return;
      }

      const result = await register(formData.username, formData.email, formData.password);
      if (!result.success) {
        setError(result.error);
        return;
      }
      
      if (result.requireVerification) {
        setVerificationEmail(formData.email);
        setShowVerification(true);
      }
    } else {
      // التحقق من صحة البيانات عند تسجيل الدخول
      if (!formData.email.trim()) {
        setError('يرجى إدخال البريد الإلكتروني أو اسم المستخدم');
        return;
      }
      if (!formData.password) {
        setError('يرجى إدخال كلمة المرور');
        return;
      }

      try {
        // حفظ بيانات تسجيل الدخول إذا تم اختيار "تذكرني"
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        const result = await login(formData.email, formData.password, rememberMe);
        if (!result.success) {
          setError(result.error);
          return;
        }
      } catch (error) {
        setError('حدث خطأ أثناء تسجيل الدخول');
      }
    }
  };

  // استرجاع البريد الإلكتروني المحفوظ عند تحميل النموذج
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleVerificationClose = (success) => {
    setShowVerification(false);
    if (success) {
      // تم التحقق بنجاح، يمكن للمستخدم تسجيل الدخول الآن
      setMode('login');
      setFormData(prev => ({
        ...prev,
        password: ''
      }));
    }
  };

  const handleForgotPasswordClose = (success, email) => {
    setShowForgotPassword(false);
    if (success && email) {
      setResetEmail(email);
      setShowResetPassword(true);
    }
  };

  const handleResetPasswordClose = (success) => {
    setShowResetPassword(false);
    if (success) {
      setError('');
      setFormData(prev => ({
        ...prev,
        password: ''
      }));
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
        </Typography>
        <Tabs value={mode} onChange={(e, v) => setMode(v)} variant="fullWidth" sx={{ mb: 3 }}>
          <Tab 
            value="login" 
            label="تسجيل الدخول" 
            icon={<Lock />}
            aria-label="تسجيل الدخول"
          />
          <Tab 
            value="register" 
            label="إنشاء حساب" 
            icon={<AccountCircle />}
            aria-label="إنشاء حساب جديد"
          />
        </Tabs>
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {mode === 'register' && (
              <TextField
                label="اسم المستخدم"
                required
                fullWidth
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                autoComplete="username"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            <TextField
              label={mode === 'login' ? "البريد الإلكتروني أو اسم المستخدم" : "البريد الإلكتروني"}
              required
              fullWidth
              type={mode === 'register' ? "email" : "text"}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              autoComplete={mode === 'register' ? "email" : "username"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="كلمة المرور"
              required
              fullWidth
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              autoComplete={mode === 'login' ? "current-password" : "new-password"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="تبديل رؤية كلمة المرور"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {mode === 'login' && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" color="textSecondary">
                      تذكرني
                    </Typography>
                  }
                />
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => setShowForgotPassword(true)}
                  sx={{ textDecoration: 'none' }}
                >
                  نسيت كلمة المرور؟
                </Link>
              </Box>
            )}

            {mode === 'register' && (
              <TextField
                label="تأكيد كلمة المرور"
                required
                fullWidth
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                autoComplete="new-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="تبديل رؤية تأكيد كلمة المرور"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth
              size="large"
              sx={{ mt: 2 }}
            >
              {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </Button>
          </Stack>
        </form>
      </Paper>

      <EmailVerification
        open={showVerification}
        email={verificationEmail}
        onClose={handleVerificationClose}
      />

      <ForgotPassword
        open={showForgotPassword}
        onClose={handleForgotPasswordClose}
      />

      <ResetPassword
        open={showResetPassword}
        email={resetEmail}
        onClose={handleResetPasswordClose}
      />
    </Container>
  );
};

export default AuthForm;
