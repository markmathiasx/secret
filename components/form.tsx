"use client";

import { useState, useCallback, ReactNode, createContext, useContext } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
  message?: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string;
  validation?: ValidationRule;
  options?: { value: string; label: string }[];
  defaultValue?: string | boolean;
}

interface FormContextType {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setValue: (name: string, value: any) => void;
  setTouched: (name: string) => void;
  validateField: (name: string) => void;
  validateAll: () => boolean;
  reset: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function useForm() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
}

export function FormProvider({
  children,
  fields,
  onSubmit,
  initialValues = {}
}: {
  children: ReactNode;
  fields: FieldConfig[];
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  initialValues?: Record<string, any>;
}) {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach(field => {
      initial[field.name] = initialValues[field.name] ?? field.defaultValue ?? '';
    });
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name: string) => {
    const field = fields.find(f => f.name === name);
    if (!field?.validation) return;

    const value = values[name];
    const rule = field.validation;
    let error = null;

    if (rule.required && (!value || value.toString().trim() === '')) {
      error = rule.message || 'Este campo é obrigatório';
    } else if (value) {
      if (rule.minLength && value.length < rule.minLength) {
        error = rule.message || `Mínimo de ${rule.minLength} caracteres`;
      } else if (rule.maxLength && value.length > rule.maxLength) {
        error = rule.message || `Máximo de ${rule.maxLength} caracteres`;
      } else if (rule.pattern && !rule.pattern.test(value)) {
        error = rule.message || 'Formato inválido';
      } else if (rule.custom) {
        error = rule.custom(value);
      }
    }

    setErrors(prev => ({
      ...prev,
      [name]: error || ''
    }));
  }, [values, fields]);

  const validateAll = useCallback(() => {
    let isValid = true;
    fields.forEach(field => {
      validateField(field.name);
      if (errors[field.name]) {
        isValid = false;
      }
    });
    return isValid;
  }, [fields, validateField, errors]);

  const setValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name);
    }
  }, [touched, validateField]);

  const setTouched = useCallback((name: string) => {
    setTouchedState(prev => ({ ...prev, [name]: true }));
    validateField(name);
  }, [validateField]);

  const reset = useCallback(() => {
    const resetValues: Record<string, any> = {};
    fields.forEach(field => {
      resetValues[field.name] = initialValues[field.name] ?? field.defaultValue ?? '';
    });
    setValues(resetValues);
    setErrors({});
    setTouchedState({});
  }, [fields, initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    fields.forEach(field => {
      allTouched[field.name] = true;
    });
    setTouchedState(allTouched);

    // Validate all fields
    if (!validateAll()) {
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContext.Provider
      value={{
        values,
        errors,
        touched,
        setValue,
        setTouched,
        validateField,
        validateAll,
        reset,
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {children}
        <div className="flex flex-wrap justify-end gap-4">
          <button
            type="button"
            onClick={reset}
            className="btn-ghost-sm px-4 py-2"
            disabled={isSubmitting}
          >
            Limpar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </FormContext.Provider>
  );
}

export function FormField({ config }: { config: FieldConfig }) {
  const { values, errors, touched, setValue, setTouched } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  const value = values[config.name];
  const error = errors[config.name];
  const isTouched = touched[config.name];
  const hasError = isTouched && error;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setValue(config.name, newValue);
  };

  const handleBlur = () => {
    setTouched(config.name);
  };

  const inputClasses = `field-base ${hasError ? 'border-red-300/40 focus:border-red-300 focus:ring-red-300/25' : ''}`;

  const renderInput = () => {
    switch (config.type) {
      case 'textarea':
        return (
          <textarea
            id={config.name}
            name={config.name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={config.placeholder}
            className={`${inputClasses} min-h-[120px] resize-y`}
            required={config.validation?.required}
          />
        );

      case 'select':
        return (
          <select
            id={config.name}
            name={config.name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClasses}
            required={config.validation?.required}
          >
            <option value="">Selecione...</option>
            {config.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              id={config.name}
              name={config.name}
              checked={value}
              onChange={handleChange}
              onBlur={handleBlur}
              className="h-4 w-4 rounded border-white/25 text-cyan-glow focus:ring-cyan-200"
            />
            <span className="text-sm text-white/78">{config.label}</span>
          </label>
        );

      default:
        return (
          <div className="relative">
            <input
              type={config.type === 'password' && showPassword ? 'text' : config.type}
              id={config.name}
              name={config.name}
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={config.placeholder}
              className={inputClasses}
              required={config.validation?.required}
            />
            {config.type === 'password' && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
        );
    }
  };

  if (config.type === 'checkbox') {
    return (
      <div className="space-y-1">
        {renderInput()}
        {hasError && (
          <div className="flex items-center gap-1 text-sm text-rose-200">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label htmlFor={config.name} className="block text-sm font-medium text-white/78">
        {config.label}
        {config.validation?.required && <span className="ml-1 text-rose-300">*</span>}
      </label>
      {renderInput()}
      {hasError && (
        <div className="flex items-center gap-1 text-sm text-rose-200">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      {!hasError && isTouched && value && (
        <div className="flex items-center gap-1 text-sm text-emerald-200">
          <CheckCircle className="h-4 w-4" />
          Válido
        </div>
      )}
    </div>
  );
}
