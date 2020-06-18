export const propLengthValidator = (
  prop: string,
  length: number,
  message: string
): { prop: string; validator: (pass: string) => boolean; message: string } => {
  return {
    prop,
    validator: (pass: string) => pass.length >= length,
    message,
  };
};
