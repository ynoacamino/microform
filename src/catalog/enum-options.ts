export interface EnumOption<T extends string = string> {
  key: string;
  value: T;
  label: string;
}

export function createEnumOptions<T extends string = never>(
  labels: [T] extends [never] ? "You must provide an explicit generic type argument" : Record<NoInfer<T>, string>,
): EnumOption<T>[];
export function createEnumOptions(labels: Record<string, string>): EnumOption<string>[] {
  const values = Object.keys(labels);
  return values.map((value) => ({
    key: value.toLowerCase(),
    value,
    label: labels[value] ?? value,
  }));
}

export function getOptionLabel(labels: Record<string, string>, value: string): string {
  return labels[value] ?? value;
}
