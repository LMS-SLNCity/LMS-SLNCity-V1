import React from 'react';

type Option = string | { label: string; value: string | number };

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ label, name, options, className, ...rest }) => {
  return (
    <div className={className}>
      {label && <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>}
      <select
        id={name}
        name={name}
        {...rest}
        className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-gray-100"
      >
        {/* The parent component is now responsible for providing a placeholder option if needed */}
        {options.map((option, index) => {
          const value = typeof option === 'string' ? option : option.value;
          const label = typeof option === 'string' ? option : option.label;
          return <option key={index} value={value}>{label}</option>;
        })}
      </select>
    </div>
  );
};
