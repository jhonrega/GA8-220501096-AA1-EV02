// Importar las dependencias necesarias
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');

// Crear una aplicación Express
const app = express();

// Configurar body-parser para manejar las solicitudes JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/authDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Conectado a MongoDB');
    })
    .catch((error) => {
        console.error('Error conectando a MongoDB:', error);
    });

// Definir el esquema y el modelo de usuario
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Ruta para registrar un nuevo usuario
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Se requiere nombre de usuario y contraseña' });
    }

    try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        // Crear un nuevo usuario y guardar en la base de datos
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para iniciar sesión
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Se requiere nombre de usuario y contraseña' });
    }

    try {
        // Verificar las credenciales del usuario
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            // Generar un token JWT
            const token = jwt.sign({ id: user._id }, 'secret_key', { expiresIn: '1h' });

            // Almacenar el token en una cookie para la sesión
            res.cookie('token', token, { httpOnly: true });

            // Redirigir a la página del dashboard
            console.log('Autenticación exitosa, redirigiendo a /dashboard.html');
            return res.redirect('/dashboard.html');
        } else {
            console.log('Usuario o contraseña inválido');
            return res.status(401).json({ error: 'Usuario o contraseña inválido' });
        }
    } catch (error) {
        console.error('Error interno del servidor:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para servir la página de inicio de sesión
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// Middleware para verificar el token JWT
function authenticateToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        console.log('No token found, redirecting to login');
        return res.redirect('/login.html');
    }

    jwt.verify(token, 'secret_key', (err, user) => {
        if (err) {
            console.log('Token verification failed, redirecting to login');
            return res.redirect('/login.html');
        }
        console.log('Token verified, user:', user);
        req.user = user;
        next();
    });
}

// Ruta protegida para el dashboard
app.get('/dashboard.html', authenticateToken, (req, res) => {
    console.log('User authenticated, serving dashboard.html');
    res.sendFile(path.join(__dirname, '../public', 'dashboard.html'));
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`El servidor está corriendo en el puerto ${PORT}`);
});

// Definir el esquema y el modelo de incidente
const incidentSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    incidentType: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    responsible: { type: String, required: true },
    actionsTaken: { type: String, required: true },
    results: { type: String, required: true }
});

const Incident = mongoose.model('Incident', incidentSchema);

// Ruta para registrar un nuevo incidente
app.post('/register-incident', async (req, res) => {
    const { date, incidentType, description, location, responsible, actionsTaken, results } = req.body;

    if (!date || !incidentType || !description || !location || !responsible || !actionsTaken || !results) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const newIncident = new Incident({
            date,
            incidentType,
            description,
            location,
            responsible,
            actionsTaken,
            results
        });

        await newIncident.save();

        res.status(201).json({ message: 'Incidente registrado exitosamente' });
    } catch (error) {
        console.error('Error interno del servidor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para obtener todos los incidentes
app.get('/incidents', async (req, res) => {
    try {
        const incidents = await Incident.find();
        res.status(200).json(incidents);
    } catch (error) {
        console.error('Error interno del servidor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
