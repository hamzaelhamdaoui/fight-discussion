import { es } from '@/lib/translations/es';

export function useTranslations() {
  return es;
}

/**
 * Template string interpolation for translations
 * @example t("Hola {{name}}", { name: "Juan" }) // "Hola Juan"
 */
export function t(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(values[key] ?? ''));
}
