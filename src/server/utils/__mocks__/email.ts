export const sendWelcomeEmail = jest.fn();

export const sendPasswordResetEmail = jest
  .fn()
  .mockResolvedValue({}) // Default is to be resolved (starting third time)
  .mockResolvedValueOnce({}) // The first time called will be resolved
  .mockRejectedValueOnce({}); // The second time called will be rejected
