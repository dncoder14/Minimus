const { z } = require('zod');
const { HttpError } = require('./errors');

// validate({ body, query, params }) -> middleware that parses and replaces req parts
const validate = (schemas) => (req, res, next) => {
  for (const part of ['body', 'query', 'params']) {
    if (!schemas[part]) continue;
    const result = schemas[part].safeParse(req[part]);
    if (!result.success) {
      const message = result.error.issues.map((i) => `${i.path.join('.') || part}: ${i.message}`).join('; ');
      return next(new HttpError(400, message));
    }
    // req.query is a getter in Express 5, so define the parsed value instead of assigning
    Object.defineProperty(req, part, { value: result.data, writable: true, configurable: true });
  }
  next();
};

const page = z.coerce.number().int().min(1).default(1);
const limit = (max = 50, def = 20) => z.coerce.number().int().min(1).max(max).default(def);
const mediaId = z.string().regex(/^(tt\d{5,12}|tmdb(movie|tv)?\d{1,10})$/, 'Invalid movie id');

module.exports = { z, validate, page, limit, mediaId };
