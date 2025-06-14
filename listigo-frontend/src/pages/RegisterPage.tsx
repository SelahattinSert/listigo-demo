
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserDto } from '../types';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { ROUTES, PASSWORD_VALIDATION } from '../constants';
import { isValidEmail, isValidPhoneNumber, validatePassword } from '../utils/validators';
import { useAuth } from '../hooks/useAuth';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<UserDto & { confirmPassword?: string }>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof (UserDto & { confirmPassword?: string }), string>>>({});
  const [formValidations, setFormValidations] = useState<Record<string, boolean>>({
    email: false,
    password: false,
    confirmPassword: false,
    name: false,
    phone: false,
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate(ROUTES.HOME);
  }

  const handleValidation = (field: string, isValid: boolean) => {
    setFormValidations(prev => ({ ...prev, [field]: isValid }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name as keyof typeof formData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (name === "email") handleValidation("email", isValidEmail(value));
    if (name === "phone") handleValidation("phone", isValidPhoneNumber(value));
    if (name === "password") {
        const passwordValidation = validatePassword(value);
        handleValidation("password", passwordValidation.isValid);
        if (!passwordValidation.isValid) {
            setErrors(prev => ({...prev, password: passwordValidation.message}));
        }
    }
    if (name === "confirmPassword") handleValidation("confirmPassword", value === formData.password);
    if (name === "name") handleValidation("name", value.trim().length >= 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const currentErrors: Partial<Record<keyof typeof formData, string>> = {};
    if (!isValidEmail(formData.email)) currentErrors.email = "Geçerli bir e-posta girin.";
    if (!formData.name.trim() || formData.name.trim().length < 2) currentErrors.name = "İsim en az 2 karakter olmalıdır.";
    if (!isValidPhoneNumber(formData.phone)) currentErrors.phone = "Geçerli bir telefon numarası girin.";
    
    const passwordValidation = validatePassword(formData.password || '');
    if (!passwordValidation.isValid) {
      currentErrors.password = passwordValidation.message || PASSWORD_VALIDATION.errorMessage;
    }
    if (formData.password !== formData.confirmPassword) currentErrors.confirmPassword = "Şifreler eşleşmiyor.";

    setErrors(currentErrors);

    const allFieldsValid = Object.values(formValidations).every(isValid => isValid);
    if (Object.keys(currentErrors).length > 0 || !allFieldsValid) {
      return;
    }

    setIsLoading(true);
    try {
      const { confirmPassword, ...userData } = formData; 
      await register(userData);
      navigate(ROUTES.LOGIN, { state: { message: 'Kayıt başarılı! Lütfen giriş yapın.' } });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-15rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-darkSurface p-10 rounded-xl shadow-2xl transition-colors duration-300">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary dark:text-blue-400">
            Yeni Hesap Oluştur
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {apiError && <Alert type="error" message={apiError} onClose={() => setApiError(null)} />}
          
          <Input
            label="İsim Soyisim"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            validate={(value) => value.trim().length >= 2 || "İsim en az 2 karakter olmalıdır."}
            onValidation={(isValid) => handleValidation('name', isValid)}
            placeholder="Adınız Soyadınız"
          />
          <Input
            label="E-posta Adresi"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            validate={isValidEmail}
            onValidation={(isValid) => handleValidation('email', isValid)}
            placeholder="ornek@mail.com"
          />
          <Input
            label="Telefon Numarası"
            name="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            validate={isValidPhoneNumber}
            onValidation={(isValid) => handleValidation('phone', isValid)}
            placeholder="+90 555 123 4567"
          />
          <Input
            label="Şifre"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            validate={(value) => {
                const res = validatePassword(value);
                return res.isValid || (res.message || PASSWORD_VALIDATION.errorMessage);
            }}
            onValidation={(isValid) => handleValidation('password', isValid)}
            placeholder="Şifreniz"
          />
          <Input
            label="Şifreyi Onayla"
            name="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword || ''}
            onChange={handleChange}
            error={errors.confirmPassword}
            validate={(value) => value === formData.password || "Şifreler eşleşmiyor."}
            onValidation={(isValid) => handleValidation('confirmPassword', isValid)}
            placeholder="Şifrenizi tekrar girin"
          />
          
          <Button type="submit" isLoading={isLoading} className="w-full" variant="primary" size="lg">
            Kayıt Ol
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-darkMutedText">
          Zaten bir hesabınız var mı?{' '}
          <Link to={ROUTES.LOGIN} className="font-medium text-secondary dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300">
            Giriş Yapın
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;