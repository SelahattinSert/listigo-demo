
import React, { useState, useEffect } from 'react';
import { UserDto, UserMetadata } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { isValidEmail, isValidPhoneNumber } from '../../utils/validators';

interface EditProfileFormProps {
  currentUser: UserMetadata;
  onUpdateProfile: (userData: UserDto) => Promise<UserMetadata | void>; 
  isSubmitting: boolean;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ currentUser, onUpdateProfile, isSubmitting }) => {
  const [formData, setFormData] = useState<UserDto>({
    email: currentUser.email, // Email is typically not editable, but display it.
    name: currentUser.name,
    phone: currentUser.phone,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserDto, string>>>({});
  const [formValidations, setFormValidations] = useState<Record<string, boolean>>({
    name: true,
    phone: true,
  });

  useEffect(() => {
    setFormData({
      email: currentUser.email,
      name: currentUser.name,
      phone: currentUser.phone,
    });
  }, [currentUser]);

  const handleValidation = (field: string, isValid: boolean) => {
    setFormValidations(prev => ({ ...prev, [field]: isValid }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
     if (errors[name as keyof UserDto]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserDto, string>> = {};
    if (!formData.name.trim()) newErrors.name = "İsim boş olamaz.";
    if (!formData.phone.trim()) newErrors.phone = "Telefon numarası boş olamaz.";
    else if (!isValidPhoneNumber(formData.phone)) newErrors.phone = "Geçerli bir telefon numarası girin.";
    
    // Check dynamic validations
    if (!formValidations.name) newErrors.name = errors.name || "İsim geçersiz.";
    if (!formValidations.phone) newErrors.phone = errors.phone || "Telefon numarası geçersiz.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && Object.values(formValidations).every(v => v);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Backend UserDto for update doesn't need password.
    // Email is also not updatable via this DTO in backend service.
    const updateData: UserDto = {
        email: formData.email, // Include email even if not changed, for consistency with DTO. Backend might ignore it.
        name: formData.name,
        phone: formData.phone,
    };
    await onUpdateProfile(updateData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="E-posta"
        name="email"
        type="email"
        value={formData.email}
        disabled // Email generally not editable
        containerClassName="opacity-70"
      />
      <Input
        label="İsim Soyisim"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        validate={(value) => value.trim().length >= 2 || "İsim en az 2 karakter olmalıdır."}
        onValidation={(isValid) => handleValidation('name', isValid)}
        required
      />
      <Input
        label="Telefon Numarası"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
        validate={isValidPhoneNumber}
        onValidation={(isValid) => handleValidation('phone', isValid)}
        required
      />
      <Button type="submit" isLoading={isSubmitting} className="w-full" variant="primary">
        Bilgileri Güncelle
      </Button>
    </form>
  );
};

export default EditProfileForm;
