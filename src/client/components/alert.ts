export enum AlertType {
  Success = 'success',
  Error = 'error',
}

export const hideAlert = (): void => {
  const alert = document.querySelector('.alert');
  if (alert) alert.parentElement!.removeChild(alert);
};

export const showAlert = (type: AlertType, message: string): void => {
  hideAlert();

  const alertMarkup = `<div class="alert alert--${type}">${message}</div>`;
  document.querySelector('body')!.insertAdjacentHTML('afterbegin', alertMarkup);

  window.setTimeout(hideAlert, 2000);
};
