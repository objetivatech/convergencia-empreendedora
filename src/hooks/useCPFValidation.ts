import { useState } from "react";

export const useCPFValidation = () => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateCPF = (cpf: string): boolean => {
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) {
      return false;
    }
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleanCPF)) {
      return false;
    }
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let checkDigit = 11 - (sum % 11);
    if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
    if (checkDigit !== parseInt(cleanCPF.charAt(9))) {
      return false;
    }
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    checkDigit = 11 - (sum % 11);
    if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
    if (checkDigit !== parseInt(cleanCPF.charAt(10))) {
      return false;
    }
    
    return true;
  };

  const formatCPF = (value: string): string => {
    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara XXX.XXX.XXX-XX
    return numbers
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
  };

  const validateField = (fieldName: string, value: string, required: boolean = true): string | null => {
    if (!value && required) {
      return 'Este campo é obrigatório';
    }
    
    if (fieldName === 'cpf' && value) {
      if (!validateCPF(value)) {
        return 'CPF inválido';
      }
    }
    
    if (fieldName === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Email inválido';
      }
    }
    
    if (fieldName === 'phone' && value) {
      const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
      if (!phoneRegex.test(value)) {
        return 'Telefone inválido (use formato (XX) XXXXX-XXXX)';
      }
    }
    
    return null;
  };

  const formatPhone = (value: string): string => {
    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (XX) XXXXX-XXXX
    return numbers
      .slice(0, 11)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})/, '$1-$2');
  };

  const setFieldError = (fieldName: string, error: string | null) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error || ''
    }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  const hasErrors = (): boolean => {
    return Object.values(errors).some(error => error !== '');
  };

  return {
    validateCPF,
    formatCPF,
    formatPhone,
    validateField,
    setFieldError,
    clearErrors,
    hasErrors,
    errors
  };
};