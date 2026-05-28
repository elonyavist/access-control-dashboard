export interface EventFormValues {
  title: string;
  date: string;
}

export interface EventFormErrors {
  title?: string;
  date?: string;
}

export interface EventFormProps {
  initialValue?: EventFormValues;
  onSave: (values: EventFormValues) => void;
  onCancel: () => void;
}
