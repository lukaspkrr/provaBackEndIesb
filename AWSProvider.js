const AWS = require('aws-sdk');
AWS.config.update({
    region: 'sa-east-1'
});
const isLocal = process.env.TODOMANAGERLOCAL
if (!isLocal) {
    AWS.config.update({
        credentials: {
            accessKeyId: 'escrevaraquioaccesskeyid',
            secretAccessKey: 'escrevaaquiosecretaccesskey'
        }
    });
} else {
    AWS.config.update({
        accessKeyId: "escrevaraquioaccesskeyid",
        secretAccessKey: "escrevaaquiosecretaccesskey",
        endpoint: 'http://localhost:8000/shell/'
    });
}
module.exports = AWS;