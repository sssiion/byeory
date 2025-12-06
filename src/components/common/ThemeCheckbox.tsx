interface ThemeCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
}

export function ThemeCheckbox({ checked, onChange, label }: ThemeCheckboxProps) {
    return (
        <label className="flex items-center gap-2 cursor-pointer select-none group">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 transition-colors focus:ring-0 cursor-pointer"
                style={{ accentColor: 'var(--accent-primary)' }}
            />
            <span className="text-sm group-hover:opacity-80 transition-opacity">{label}</span>
        </label>
    );
}
