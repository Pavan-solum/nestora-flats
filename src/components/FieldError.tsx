import type { FieldErrors } from "@/lib/validation";

export function FieldError({ id, errors }: { id: string; errors: FieldErrors }) {
  const message = errors[id];
  if (!message) return null;
  return (
    <p id={`${id}-error`} className="text-sm text-danger">
      {message}
    </p>
  );
}

export function invalidField(id: string, errors: FieldErrors) {
  if (!errors[id]) return {};
  return {
    "aria-invalid": true as const,
    "aria-describedby": `${id}-error`,
  };
}
