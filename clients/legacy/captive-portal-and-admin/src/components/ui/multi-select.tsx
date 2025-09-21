import React from "react";

export type MultiSelectOption = { value: string; label: string };

type MultiSelectProps = {
  label?: string;
  options: MultiSelectOption[];
  value: string[] | undefined;
  onChange: (next: string[]) => void;
  disabled?: boolean;
  className?: string;
  helpText?: string;
};

/**
 * Minimal, reliable multi-select using checkboxes.
 * Controlled: value is array of strings, onChange(nextArray) provided by parent form.
 */
export function MultiSelect({ label, options, value, onChange, disabled, className, helpText }: MultiSelectProps) {
  const selected = Array.isArray(value) ? value : [];

  const toggle = (optValue: string, checked: boolean) => {
    const set = new Set(selected);
    if (checked) set.add(optValue); else set.delete(optValue);
    onChange(Array.from(set));
  };

  return (
    <div className={className}>
      {label && <label className="text-sm font-medium mb-1 block">{label}</label>}
      <div className="flex flex-wrap gap-4">
        {options.map(opt => (
          <label key={opt.value} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              value={opt.value}
              checked={selected.includes(opt.value)}
              onChange={(e) => toggle(opt.value, e.target.checked)}
              disabled={disabled}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {helpText && <p className="text-xs text-muted-foreground mt-1">{helpText}</p>}
    </div>
  );
}

export default MultiSelect;
