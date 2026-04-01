export const buildPagination = ({ page = 1, limit = 10, total = 0 }) => {
  const normalizedPage = Number(page);
  const normalizedLimit = Number(limit);

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    total,
    totalPages: Math.ceil(total / normalizedLimit) || 1,
  };
};
