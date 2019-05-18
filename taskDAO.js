const AWS = require('./AWSProvider');
const uuid = require('uuid');

const dynamoDB = new AWS.DynamoDB();


const init = (callback) => {
    dynamoDB.listTables({}, (err, data) => {
        if (err) {
            callback(err, null);
        } else {


            if (data.TableNames.indexOf('Todo') == -1) {
                dynamoDB.createTable({
                    TableName: 'Todo',
                    AttributeDefinitions: [
                        { AttributeName: 'id', AttributeType: 'S' },
                    ],
                    KeySchema: [
                        { AttributeName: 'id', KeyType: 'HASH' },
                    ],
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 1,
                        WriteCapacityUnits: 1
                    },
                }, (err, data) => {
                    callback(err, data);
                })
            } else {
                callback(err, { message: 'ok' });
            }

            var params = {

                Limit: 2, // optional (to further limit the number of table names returned per page)
            };
            dynamoDB.listTables(params, function (err, data) {
                if (err) console.log(err) // an error occurred
                else console.log(data);

            });
        }
    });
}


const insert = async (todo, callback) => {
    const { title, description, isDone, isPriority } = todo;
    const id = todo.id || uuid();
    await
        dynamoDB.putItem({
            TableName: 'Todo',
            Item: {
                "id": { S: id },
                "title": { S: title },
                "description": { S: description },
                "isDone": { BOOL: isDone },
                "isPriority": { BOOL: isPriority }
            }
        },
            (err, data) => {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, {
                        id,
                        title,
                        description,
                        isDone,
                        isPriority
                    })
                }
            });
}

const listAll = (callback) => {
    dynamoDB.scan({ TableName: 'Todo' }, (err, data) => {
        if (err) {
            callback(err, null);
        } else {
            const list = [];
            data.Items.forEach(item => {
                const todo = {
                    id: item.id.S,
                    title: item.title.S,
                    description: item.description.S,
                    isDone: item.isDone.BOOL,
                    isPriority: item.isPriority.BOOL,
                }
                list.push(todo);
            });
            
            callback(null, list);
        }
    });
}

const findTaskById = (id, callback) => {
    dynamoDB.getItem({
        TableName: 'Todo',
        Key: {
            "id": { S: id }
        }
    }, (err, data) => {
        if (err) {
            callback(err, null);
        } else {
            const item = data.Item;
            var todo = null;
            if (item) {
                todo = {
                    id: item.id.S,
                    title: item.title.S,
                    description: item.description.S,
                    isDone: item.isDone.BOOL,
                    isPriority: item.isPriority.BOOL,
                }
            }
            callback(null, todo)
        }
    });
}


const remove = (id, callback) => {
    findTaskById(id, (err, task) => {
        dynamoDB.deleteItem({
            TableName: 'Todo',
            Key: {
                "id": {
                    S: id
                }
            }
        }, (err, data) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, task);
            }
        })
    });
}

module.exports = { insert, listAll, findTaskById, remove, init }