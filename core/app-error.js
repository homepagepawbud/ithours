module.exports = function AppError(code) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.code = code;
   // this.extra = extra;
    // return this;
};

require('util').inherits(module.exports, Error);