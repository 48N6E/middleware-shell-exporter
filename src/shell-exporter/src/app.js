const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const globalErrorHandler = require('./controllers/errorController').errorHandler;
const bodyParser = require('body-parser');

const execRouter = require('./routes/execRouter');
const metricRouter = require('./routes/metricRouter');

//Create express
const app = express();

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
    max: 100000,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api/v1/exec', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '1000mb' }));
app.use(bodyParser.urlencoded({limit: '1000mb',extended:false}));

//ROUTES
app.use('/api/v1/exec', execRouter);
app.use('/api/v1/metrics', metricRouter);

app.use(globalErrorHandler);

module.exports = app;
