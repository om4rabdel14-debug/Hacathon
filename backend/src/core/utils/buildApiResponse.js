function success(data, message = 'Success') {
  return {
    success: true,
    message,
    data,
  };
}

function error(message = 'An error occurred', errors = null) {
  return {
    success: false,
    message,
    errors,
  };
}

function paginated(data, total, page, limit) {
  return {
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

module.exports = { success, error, paginated };
