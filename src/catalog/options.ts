export interface BaseOption<V extends string> {
  key: string;
  value: V;
  label: string;
}

export interface SelectOption<V extends string = string> extends BaseOption<V> {}

export interface PersonOption<V extends string = string> extends BaseOption<V> {
  subtitle?: string;
  avatarUrl?: string;
  initials?: string;
}

export interface DrawerSelectOption<V extends string = string> extends PersonOption<V> {
  triggerLabel?: string;
}

export interface CheckboxGroupOption<V extends string = string> extends BaseOption<V> {
  subtitle?: string;
  badge?: string;
  disabled?: boolean;
}

export interface ModalPickerSettings<T = Record<string, unknown>> {
  getOption: (item: T) => PersonOption;
  modalTitle?: string;
  modalDescription?: string;
}

export type AsyncCheckboxGroupData =
  | CheckboxGroupOption[]
  | {
      items?: Record<string, unknown>[];
      totalItems?: number;
    };
