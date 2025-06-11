const formatZodErrors = (zodError)=> {
  return zodError.errors.map((err) => ({
    field: err.path.join(".") || "root",
    message: err.message,
  }));
}

module.exports = {formatZodErrors}