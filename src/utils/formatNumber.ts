export function formatNumber(
  value: number | string | undefined | null,
  options?: { decimals?: number; emptyValues?: string }
) {
  const { decimals = 2, emptyValues = "-" } = options ?? {};
  if (isNaN(Number(value)) || (value as unknown) instanceof Date) return value?.toString();
  value = Number(value);

  if (value === 0) return emptyValues;

  const formatter = Intl.NumberFormat("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return formatter.format(value);
}
