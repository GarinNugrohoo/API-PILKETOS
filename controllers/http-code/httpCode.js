class HttpCode {
  static send(res, status, options = {}) {
    let response = {
      success: status >= 200 && status < 300,
    };

    return res.status(status).json({
      ...response,
      ...options,
    });
  }
}

module.exports = HttpCode;
