import { ActionTypes, SetBtnLoaderAction } from '../utilities';

export const setBtnLoader = (value: boolean): SetBtnLoaderAction => {
  return {
    type: ActionTypes.setBtnLoader,
    payload: value,
  };
};
