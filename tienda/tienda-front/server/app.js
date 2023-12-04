const express = require('express');
const cors = require('cors');
const app = express();
const port = 3005;

// Middleware 
app.use(express.json());
app.use(cors());

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Aquí puedes agregar la lógica para verificar el nombre de usuario y contraseña
    // Para este ejemplo, simplemente devolveremos un mensaje de éxito
    if (username === 'usuario1' && password === '123') {
        res.json({ success: true, message: 'Login exitoso!' });
    } else {
        res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
