const paginate = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;
  const search = req.query.search?.trim() || '';

  return {
    page,
    limit,
    skip,
    search,
  };
};

module.exports = paginate;
