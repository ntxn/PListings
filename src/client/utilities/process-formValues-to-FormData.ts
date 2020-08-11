/**
 * Process form values (except photos) to FormData before submission
 */
export const processFormValuesToFormData = (
  formValues: Record<string, any>,
  formData: FormData
): void => {
  formData.append('location', JSON.stringify(formValues.location));
  delete formValues.location;

  Object.keys(formValues).forEach(field =>
    formData.append(field, formValues[field])
  );
};
