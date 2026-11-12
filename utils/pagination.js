const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// Converte page/limit da query em números válidos, com padrão e teto.
function parsePagination(query = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.parseInt(query.limit, 10) || DEFAULT_LIMIT),
  );

  return { page, limit, skip: (page - 1) * limit };
}

module.exports = { parsePagination, MAX_LIMIT };
