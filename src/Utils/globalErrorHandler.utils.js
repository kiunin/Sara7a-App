export const globalErrorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.cause || 500;
  return res.status(status).json({
    message: "Somenthing went wrong",
    error: err.message,
    stack: err.stack,
  });
};
