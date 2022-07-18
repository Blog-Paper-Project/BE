const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    try {
      await requestHandler(req, res);
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
};
module.exports = asyncHandler;
