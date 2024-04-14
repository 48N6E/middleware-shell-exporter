exports.AppError = class  extends Error {
    constructor(message, statusCode) {
        super();//all err convert message
        this.message = message;
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        Error.captureStackTrace(this, this.constructor);
    }
}


const _errorHandler = (err, req, res) => {
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).render('error', {
        title: '出错了!',
        msg: err.message
    });
};


exports.errorHandler = function ( err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        _errorHandler(err, req, res);
    }
};

