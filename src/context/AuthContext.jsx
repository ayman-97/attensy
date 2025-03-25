import React, { createContext, useContext, useState, useEffect } from 'react';
import { sendVerificationEmail, sendPasswordResetEmail as sendResetEmailService } from '../services/emailService';

const AuthContext = createContext();

// تخزين المستخدمين الافتراضيين
const defaultUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'aymankhalil31@gmail.com',
    password: '123456',
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  }
];

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(() => {
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : defaultUsers;
  });
  const [pendingVerifications, setPendingVerifications] = useState({});
  const [pendingPasswordResets, setPendingPasswordResets] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing user:', err);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const generateVerificationCode = () => {
    // توليد رمز مكون من 6 أرقام
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
  };

  const login = async (emailOrUsername, password, rememberMe = false) => {
    const user = users.find(u => 
      (u.email === emailOrUsername || u.username === emailOrUsername) && 
      u.password === password
    );
    
    if (user) {
      if (!user.emailVerified) {
        return { success: false, error: 'يرجى تأكيد بريدك الإلكتروني أولاً' };
      }
      setCurrentUser(user);
      
      // حفظ بيانات المستخدم في localStorage فقط إذا تم تفعيل خيار "تذكرني"
      if (rememberMe) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('currentUser');
      }
      
      return { success: true };
    }
    return { success: false, error: 'البريد الإلكتروني/اسم المستخدم أو كلمة المرور غير صحيحة' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberedEmail');
  };

  const register = async (username, email, password) => {
    if (users.some(u => u.username === username)) {
      return { success: false, error: 'اسم المستخدم مستخدم بالفعل' };
    }
    if (users.some(u => u.email === email)) {
      return { success: false, error: 'البريد الإلكتروني مستخدم بالفعل' };
    }

    const verificationCode = generateVerificationCode();
    const emailSent = await sendVerificationEmail(email, verificationCode);

    if (!emailSent) {
      return { success: false, error: 'حدث خطأ في إرسال رمز التحقق' };
    }

    const newUser = { 
      id: crypto.randomUUID(), 
      username, 
      email,
      password,
      emailVerified: false,
      createdAt: new Date().toISOString()
    };

    setPendingVerifications(prev => ({
      ...prev,
      [email]: { code: verificationCode, user: newUser }
    }));

    return { 
      success: true, 
      requireVerification: true,
      email
    };
  };

  const verifyEmail = (email, code) => {
    const verification = pendingVerifications[email];
    if (!verification) {
      return { success: false, error: 'لم يتم العثور على طلب التحقق' };
    }

    if (verification.code !== code) {
      return { success: false, error: 'رمز التحقق غير صحيح' };
    }

    const newUser = { ...verification.user, emailVerified: true };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // حذف التحقق المعلق
    setPendingVerifications(prev => {
      const { [email]: removed, ...rest } = prev;
      return rest;
    });

    return { success: true };
  };

  const resendVerificationCode = async (email) => {
    const verification = pendingVerifications[email];
    if (!verification) {
      return { success: false, error: 'لم يتم العثور على طلب التحقق' };
    }

    const newCode = generateVerificationCode();
    const emailSent = await sendVerificationEmail(email, newCode);

    if (!emailSent) {
      return { success: false, error: 'حدث خطأ في إرسال رمز التحقق' };
    }

    setPendingVerifications(prev => ({
      ...prev,
      [email]: { ...prev[email], code: newCode }
    }));

    return { success: true };
  };

  const sendPasswordResetEmail = async (email) => {
    try {
      const user = users.find(u => u.email === email);
      if (!user) {
        return { success: false, error: 'لم يتم العثور على حساب بهذا البريد الإلكتروني' };
      }

      const resetCode = generateVerificationCode();

      // حفظ الرمز قبل إرسال البريد
      setPendingPasswordResets(prev => ({
        ...prev,
        [email]: {
          code: resetCode,
          userId: user.id,
          expiry: new Date(Date.now() + 30 * 60000) // صالح لمدة 30 دقيقة
        }
      }));

      const emailSent = await sendResetEmailService(email, resetCode);
      console.log('Email sending result:', emailSent); // للتأكد من نتيجة الإرسال

      if (!emailSent) {
        // إزالة الرمز إذا فشل الإرسال
        setPendingPasswordResets(prev => {
          const { [email]: removed, ...rest } = prev;
          return rest;
        });
        return { success: false, error: 'حدث خطأ في إرسال رمز إعادة تعيين كلمة المرور' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in sendPasswordResetEmail:', error);
      return { success: false, error: 'حدث خطأ غير متوقع' };
    }
  };

  const verifyResetCode = (email, code) => {
    const resetRequest = pendingPasswordResets[email];
    if (!resetRequest) {
      return { success: false, error: 'لم يتم العثور على طلب إعادة تعيين كلمة المرور' };
    }

    if (new Date() > new Date(resetRequest.expiry)) {
      // حذف الطلب منتهي الصلاحية
      setPendingPasswordResets(prev => {
        const { [email]: removed, ...rest } = prev;
        return rest;
      });
      return { success: false, error: 'انتهت صلاحية رمز إعادة التعيين' };
    }

    if (resetRequest.code !== code) {
      return { success: false, error: 'رمز إعادة التعيين غير صحيح' };
    }

    return { success: true, userId: resetRequest.userId };
  };

  const resetPassword = (email, code, newPassword) => {
    const verification = verifyResetCode(email, code);
    if (!verification.success) {
      return verification;
    }

    const updatedUsers = users.map(user => {
      if (user.id === verification.userId) {
        return { ...user, password: newPassword };
      }
      return user;
    });

    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // حذف طلب إعادة التعيين بعد نجاح العملية
    setPendingPasswordResets(prev => {
      const { [email]: removed, ...rest } = prev;
      return rest;
    });

    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      login, 
      logout, 
      register,
      verifyEmail,
      resendVerificationCode,
      sendPasswordResetEmail,
      verifyResetCode,
      resetPassword,
      isAuthenticated: !!currentUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
