export const successResponse = async ({
  res,
  statusCode = 200,
  message = "Done",
  data = {},
} = {}) => {
  return res.status(statusCode).json({ message, data });
};
