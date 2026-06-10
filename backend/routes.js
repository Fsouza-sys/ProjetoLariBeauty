const express = require('express')
const router = express.Router()
const pool = require('./src/db');

// ROTA: Listar Clientes
router.get("/clientes", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM tbclientes")
        res.json(rows)
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar clientes: " + error.message })
    }
})

// ROTA: Verificar e Cadastrar Cliente
router.post("/clientes/verificar", async (req, res) => {
    try {
        const { nomecli, telcel } = req.body

        // Busca o cliente pelo telefone (que é único)
        const [existente] = await pool.query("SELECT idCli FROM tbclientes WHERE telcel = ?", [telcel])

        if (existente.length > 0) {
            return res.json({ idCli: existente[0].idCli, mensagem: "Cliente já cadastrado" })
        }

        // Cliente novo, realiza o cadastro automático
        const [result] = await pool.query(
            "INSERT INTO tbclientes (nomecli, telcel) VALUES (?, ?)",
            [nomecli, telcel]
        )
        res.status(201).json({ idCli: result.insertId, nomecli, telcel, mensagem: "Cliente cadastrado com sucesso" })
    } catch (error) {
        res.status(500).json({ erro: "Erro ao processar cliente: " + error.message })
    }
})
// ROTA: Listar Serviços
router.get("/servicos", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM tbservicos")
        res.json(rows)
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar serviços: " + error.message })
    }
})

// ROTA: Listar Disponibilidade por Data
router.get("/disponibilidade/data/:data", async (req, res) => {
    try {
        const { data } = req.params
        const [rows] = await pool.query(
            "SELECT * FROM tbdisponibilidade WHERE data_disp = ? AND status = 'disponivel'",
            [data]
        )
        res.json(rows)
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar horários: " + error.message })
    }
})

// ROTA: Criar Agendamento
router.post('/agendamentos', async (req, res) => {
    try {
        const { idCli, data_agend, horario_agend, servico, idDisp } = req.body

        const [result] = await pool.query(
            "INSERT INTO tbagendamentos(data_agend, horario_agend, idCli, servico) VALUES (?, ?, ?, ?)",
            [data_agend, horario_agend, idCli, servico]
        )

        if (idDisp) {
            await pool.query(
                "UPDATE tbdisponibilidade SET status = 'reservado' WHERE idDisp = ?",
                [idDisp]
            )
        }

        res.status(201).json({ idagend: result.insertId, mensagem: "Agendamento realizado com sucesso!" })
    } catch (error) {
        res.status(500).json({ erro: "Erro ao criar agendamento: " + error.message })
    }
})

// ROTA: Consultar Meus Agendamentos por nome
router.get("/agendamentos/cliente/nome/:nome", async (req, res) => {
    try {
        const { nome } = req.params
        const query = `
            SELECT a.idagend, a.data_agend, a.horario_agend, a.servico, c.nomecli, c.telcel
            FROM tbagendamentos a
            JOIN tbclientes c ON a.idCli = c.idCli
            WHERE c.nomecli LIKE ?
            ORDER BY a.data_agend DESC, a.horario_agend DESC
        `
        const [rows] = await pool.query(query, [`%${nome}%`])
        res.json(rows)
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar seus agendamentos: " + error.message })
    }
})

// ROTA: Consultar Meus Agendamentos por telefone
router.get("/agendamentos/cliente/tel/:telcel", async (req, res) => {
    try {
        const { telcel } = req.params
        const query = `
            SELECT a.idagend, a.data_agend, a.horario_agend, a.servico, c.nomecli 
            FROM tbagendamentos a
            JOIN tbclientes c ON a.idCli = c.idCli
            WHERE c.telcel = ?
            ORDER BY a.data_agend DESC, a.horario_agend DESC
        `
        const [rows] = await pool.query(query, [telcel])
        res.json(rows)
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar seus agendamentos: " + error.message })
    }
})

module.exports = router
