require('dotenv').config() // Carrega configurações do .env
const express = require('express')
const cors = require('cors')
const rotasApi = require('../routes.js') // Importa as rotas 

const app = express()
const port = process.env.PORT || 3001 

app.use(cors()) // Permite que o frontend 
app.use(express.json()) 
app.use('/api', rotasApi)

const servidor = app.listen(port, () => {
    console.log(`[SUCESSO] Servidor backend rodando na porta ${port}`)
})

process.on('SIGINT', () => {
    servidor.close(() => {
        console.log('Servidor encerrado de forma segura.')
        process.exit(0)
    })
})
