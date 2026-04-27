class ApiKey {
  keyAccess(req, res, next) {
    const userApiKey = req.headers["key"];
    const validApiKey = process.env.KEY;

    if (!userApiKey || userApiKey !== validApiKey) {
      return res.status(401).json({
        message: "API-KEY tidak valid",
      });
    }

    next();
  }
}

module.exports = new ApiKey();
