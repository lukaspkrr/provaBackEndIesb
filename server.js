const app = require('express')();
const jwt = require('jsonwebtoken');
const taskDAO = require('./taskDAO.js');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const porta = 3000
const secretKey = `IAmAHappyDeveloper`;
const usuarios = [{
        username: 'usuario', 
        password: '123456'
    }]

gerarJWT = (usuario) => {
    return jwt.sign({
        usuario
    }, secretKey, { expiresIn: 36000000 });
}

verificarTokenJWT = (req, res, next) => {
    const { headers, url } = req;
    if (url == '/' || url == '/login') {
        return next();
    }

    var token = headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'Token não encontrado' })

    try {
        var jwtDecodificado = jwt.verify(token, secretKey);
        tempoDeLogin = ((new Date().getTime() + 1) / 1000 - jwtDecodificado.exp) * -1
        next();
    } catch (error) {
        res.status(500).send({ auth: false, message: 'Token inválido' })
    }
}

app.use(verificarTokenJWT);

//Requisição 1
app.get('/', (req, res) => {
    res.status(200).send({message:'ok'});
});

//Requisição 2 e 3 
app.post('/login', ({ body }, res) => {
    let usuarioEncontrado = usuarios.find(usuario => body.username == usuario.username && body.password == usuario.password);

    usuarioEncontrado 
        ? res.status(200).send({ token: gerarJWT(usuarioEncontrado)}) 
        : res.status(401).send({ message: 'Error in username or password' })
});
    

//Requisição 4
app.post('/tasks', ({ body }, res) => {
    const { title, description, isDone, isPriority } = body;
    const task = {
        title, 
        description, 
        isDone, 
        isPriority
    }; 

    taskDAO.insert(task, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).send(data);
        }
    });
});

//Requisição 6 
app.get('/tasks', (req, res) => {
    taskDAO.listAll((err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    });
});

//Requisição 7
app.put('/tasks/:taskId', (req, res) => {
    const { title, description, isDone, isPriority } = req.body;
    const task = {
        id: req.params.taskId,
        title,
        description,
        isDone,
        isPriority
    };
    taskDAO.insert(task, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(task);
        }
    });
});

//Requisição 8
app.get('/tasks/:taskId', (req, res) => {
    taskDAO.findTaskById(req.params.taskId, (err, task) => {
        if (task) {
            res.status(200);
            res.send(task);
        } else if (err) {
            res.status(500);
            res.send(err);
        } else {
            res.status(404);
            res.status(200).send();
        }
    });
});
    
//Requisição 9
app.delete('/tasks/:taskId', (req, res) => {
    taskDAO.remove(req.params.taskId, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    });
});


taskDAO.init((err, data) => {
    if (err) {
        console.log('Servidor nao iniciado por erro', err);
    } else {
        app.listen(porta, () => { console.log(`Rodando na porta ${porta}`)
        });
    }
});
