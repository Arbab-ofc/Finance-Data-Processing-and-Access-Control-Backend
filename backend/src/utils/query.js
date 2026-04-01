export const normalizePaginationQuery = (query, defaults = { page: 1, limit: 10 }) => {
  const page = Number(query.page) || defaults.page;
  const limit = Number(query.limit) || defaults.limit;
  return { page, limit, skip: (page - 1) * limit };
};
