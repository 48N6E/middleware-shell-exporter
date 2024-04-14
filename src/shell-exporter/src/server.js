const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err);
});

process.env.shellCount = 0
process.env.failCount = 0
process.env.successCount = 0
global.shellExecResult = {}
global.shellExecDetail = {}

dotenv.config({ path: './config.env' });
const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`应用正在${port}端口运行...`);
});

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err);
});
