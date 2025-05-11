import React, { useState, useEffect } from "react";
import { Input } from "./input";
import { Label } from "./label";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters";

interface CurrencyInputProps {
  label?: string;
  error?: string;
  value: number;
  onChange: (value: number) => void;
  showPreview?: boolean;
  previewLabel?: string;
  previewValue?: number;
  className?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ label, error, value, onChange, showPreview, previewLabel, previewValue, className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      if (!isFocused) {
        setDisplayValue(formatCurrency(value));
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setDisplayValue(inputValue);
      
      // Remove todos os caracteres não numéricos exceto vírgula e ponto
      const cleanValue = inputValue.replace(/[^\d,.-]/g, '');
      
      // Se não houver valor, retorna 0
      if (!cleanValue) {
        onChange(0);
        return;
      }
      
      // Se houver mais de uma vírgula ou ponto, mantém apenas o último
      const parts = cleanValue.split(/[.,]/);
      if (parts.length > 2) {
        const lastPart = parts.pop();
        const firstPart = parts.join('');
        const parsedValue = parseFloat(`${firstPart}.${lastPart}`);
        onChange(parsedValue);
        return;
      }
      
      // Se houver apenas uma vírgula ou ponto, converte para ponto
      const normalizedValue = cleanValue.replace(',', '.');
      const parsedValue = parseFloat(normalizedValue);
      
      if (!isNaN(parsedValue)) {
        onChange(parsedValue);
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
      setDisplayValue(value.toString().replace('.', ','));
    };

    const handleBlur = () => {
      setIsFocused(false);
      setDisplayValue(formatCurrency(value));
    };

    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
          <Input
            ref={ref}
            type="text"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn("pl-10", error && "border-red-500", className)}
            {...props}
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {showPreview && previewValue !== undefined && (
          <p className="text-sm text-muted-foreground">
            {previewLabel}: {formatCurrency(previewValue)}
          </p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput"; 