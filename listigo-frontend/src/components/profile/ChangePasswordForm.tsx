import React, { useState, useEffect } from 'react';
import { ChangePasswordForm as ChangePasswordFormType } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { validatePassword } from '../../utils/validators';
import { PASSWORD_VALIDATION } from '../../constants';

interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordFormType) => Promise<void>;
  isSubmitting: boolean;
  // Optional key prop to force re-mount and reset. 
  // If not provided, the form won't auto-reset its internal state on its own
  // but ProfilePage can trigger a reset by changing this key.
  key?: number; 
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onSubmit, isSubmitting, key: propKey }) => {
  const [formData, setFormData] = useState<ChangePasswordFormType>({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ChangePasswordFormType, string>>>({});
  const [formValidations, setFormValidations] = useState<Record<string, boolean>>({
    oldPassword: true, 
    newPassword: true,
    confirmNewPassword: true,
  });

  // Effect to reset form when the key prop changes (if provided)
  useEffect(() => {
    setFormData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    setErrors({});
    setFormValidations({ oldPassword: true, newPassword: true, confirmNewPassword: true });
  }, [propKey]);


  const handleValidation = (field: string, isValid: boolean) => {
    setFormValidations(prev => ({ ...prev, [field]: isValid }));
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ChangePasswordFormType]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    // Dynamic validation for newPassword as user types
    if (name === 'newPassword') {
      const validationResult = validatePassword(value);
      if (!validationResult.isValid) {
        setErrors(prev => ({ ...prev, newPassword: validationResult.message }));
        handleValidation('newPassword', false);
      } else {
        setErrors(prev => ({ ...prev, newPassword: undefined }));
        handleValidation('newPassword', true);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ChangePasswordFormType, string>> = {};
    if (!formData.oldPassword) newErrors.oldPassword = "Eski şifre boş olamaz.";
    
    const newPasswordValidation = validatePassword(formData.newPassword || '');
    if (!newPasswordValidation.isValid) {
      newErrors.newPassword = newPasswordValidation.message;
    } else if (formData.newPassword === formData.oldPassword && formData.oldPassword) { // Don't flag if oldPassword is empty during initial typing
      newErrors.newPassword = "Yeni şifre eski şifre ile aynı olamaz.";
    }

    if (!formData.confirmNewPassword) {
      newErrors.confirmNewPassword = "Yeni şifreyi doğrulayın.";
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = "Şifreler eşleşmiyor.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && Object.values(formValidations).every(v => v);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
    // Form reset is now handled by ProfilePage by changing the `key` prop
    // if a successful submission occurs there.
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Eski Şifre"
        name="oldPassword"
        type="password"
        value={formData.oldPassword || ''}
        onChange={handleChange}
        error={errors.oldPassword}
        required
      />
      <Input
        label="Yeni Şifre"
        name="newPassword"
        type="password"
        value={formData.newPassword || ''}
        onChange={handleChange}
        error={errors.newPassword}
        validate={(value) => {
            const res = validatePassword(value);
            return res.isValid || (res.message || PASSWORD_VALIDATION.errorMessage);
        }}
        onValidation={(isValid) => handleValidation('newPassword', isValid)}
        required
      />
      <Input
        label="Yeni Şifreyi Onayla"
        name="confirmNewPassword"
        type="password"
        value={formData.confirmNewPassword || ''}
        onChange={handleChange}
        error={errors.confirmNewPassword}
        validate={(value) => value === formData.newPassword || "Şifreler eşleşmiyor."}
        onValidation={(isValid) => handleValidation('confirmNewPassword', isValid)}
        required
      />
      <Button type="submit" isLoading={isSubmitting} className="w-full" variant="primary">
        Şifreyi Değiştir
      </Button>
    </form>
  );
};

export default ChangePasswordForm;
