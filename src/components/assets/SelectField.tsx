
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Interface para as opções de select
interface SelectOption {
  id: number;
  name: string;
}

// Interface para as props do componente
interface SelectFieldProps {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  options: SelectOption[];
  disabled?: boolean;
  required?: boolean;
}

export function SelectField({
  control,
  name,
  label,
  placeholder = "Selecione uma opção",
  description,
  options,
  disabled = false,
  required = false,
}: SelectFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}{required && " *"}</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value?.toString() || ""}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id.toString()}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
