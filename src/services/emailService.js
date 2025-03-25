import emailjs from '@emailjs/browser';

// تهيئة EmailJS
const initEmailJS = () => {
  try {
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (!publicKey) {
      console.error('EmailJS public key is missing');
      return false;
    }

    // تكوين EmailJS
    emailjs.init({
      publicKey: publicKey,
      limitRate: true // تفعيل حد معدل الإرسال
    });

    console.log('EmailJS initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing EmailJS:', error);
    return false;
  }
};

// تهيئة EmailJS عند تحميل الملف
const isInitialized = initEmailJS();

const validateEmailJSConfig = () => {
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const resetTemplateId = import.meta.env.VITE_EMAILJS_RESET_TEMPLATE_ID;

  console.log('EmailJS Configuration:', {
    publicKey: publicKey ? '✓ Set' : '✗ Missing',
    serviceId: serviceId ? '✓ Set' : '✗ Missing',
    templateId: templateId ? '✓ Set' : '✗ Missing',
    resetTemplateId: resetTemplateId ? '✓ Set' : '✗ Missing'
  });

  return {
    isValid: !!(publicKey && serviceId && templateId && resetTemplateId),
    missing: [
      !publicKey && 'Public Key',
      !serviceId && 'Service ID',
      !templateId && 'Template ID',
      !resetTemplateId && 'Reset Template ID'
    ].filter(Boolean)
  };
};

export const sendVerificationEmail = async (email, verificationCode) => {
  if (!isInitialized) {
    console.error('EmailJS is not initialized');
    return false;
  }

  if (!verificationCode) {
    console.error('Verification code is missing');
    return false;
  }
  
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID; // استخدام قالب التسجيل

  if (!serviceId || !templateId) {
    console.error('Missing EmailJS configuration');
    return false;
  }

  const templateParams = {
    to_email: email,
    to_name: email.split('@')[0],
    verification_code: verificationCode,
    subject: 'رمز تفعيل الحساب',
    message: `مرحباً {{to_name}}،

شكراً لتسجيلك في نظام الحضور.
رمز التفعيل الخاص بك هو: {{verification_code}}

يرجى إدخال هذا الرمز لتفعيل حسابك.

مع تحياتنا،
فريق نظام الحضور`
  };

  try {

    const result = await emailjs.send(
      serviceId,
      templateId,
      templateParams
    );

    //console.log('Verification email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    if (error.text) console.error('Error details:', error.text);
    return false;
  }
};

export const sendPasswordResetEmail = async (email, resetCode) => {
  if (!isInitialized) {
    console.error('EmailJS is not initialized');
    return false;
  }
  
  if (!resetCode) {
    console.error('Reset code is missing');
    return false;
  }

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_RESET_TEMPLATE_ID; // استخدام قالب إعادة تعيين كلمة المرور

  if (!serviceId || !templateId) {
    console.error('Missing EmailJS configuration');
    return false;
  }

  const templateParams = {
    to_email: email,
    to_name: email.split('@')[0],
    verification_code: resetCode,
    subject: 'رمز إعادة تعيين كلمة المرور',
    message: `مرحباً {{to_name}}،

لقد طلبت إعادة تعيين كلمة المرور الخاصة بك.
رمز إعادة التعيين الخاص بك هو: {{verification_code}}

ملاحظات مهمة:
- هذا الرمز مكون من 6 أرقام
- الرمز صالح لمدة 30 دقيقة فقط
- كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل

إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.

مع تحياتنا،
فريق نظام الحضور`
  };

  try {
    console.log('Using reset template ID:', templateId);
    console.log('Sending password reset email with params:', {
      ...templateParams,
      verification_code: '******'
    });

    const result = await emailjs.send(
      serviceId,
      templateId,
      templateParams
    );

    console.log('Password reset email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    if (error.text) console.error('Error details:', error.text);
    return false;
  }
};
