import { AlertType, showAlert } from '../components/alert';

interface Params {
  msg?: string;
  clearLoader?(): void;
}

type AsyncFunction = (params?: Params) => Promise<void>;

/**
 * A util function to catch errors from an async/await function (usually for fetching data).
 * If there's an error, it'll show alert.
 * An optional message or clearLoader function can be included.
 */
export const catchAsync = (callback: AsyncFunction): AsyncFunction => (
  params?: Params
) =>
  callback().catch(err => {
    console.log(err.response.data);

    showAlert(
      AlertType.Error,
      params && params.msg ? params.msg : 'Issue with fetching data'
    );

    if (params && params.clearLoader) params.clearLoader();
  });
