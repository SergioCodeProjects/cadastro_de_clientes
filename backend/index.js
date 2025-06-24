const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyparser = require('body-parser');
const cors = require('cors');

const app = express();
const db = new sqlite3.Database('./clientes.db');

app.use(cors());
app.use(bodyparser.json());

// Criando a tabela se não existir
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cpf_cnpj TEXT,
            nome TEXT,
            data_nascimento TEXT,
            genero TEXT,
            estado_civil TEXT,
            rg TEXT,
            email TEXT,
            celular TEXT
        )
    `);
});

// GET - Buscar todos os clientes
app.get('/clientes', (req, res) => {
    db.all(`SELECT * FROM clientes`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// POST - Cadastrar novo cliente
app.post('/clientes', (req, res) => {
    const {
        cpf_cnpj, nome, data_nascimento,
        genero, estado_civil, rg, email, celular
    } = req.body;

    db.run(`
        INSERT INTO clientes (cpf_cnpj, nome, data_nascimento, genero, estado_civil, rg, email, celular)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [cpf_cnpj, nome, data_nascimento, genero, estado_civil, rg, email, celular],
    function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// PUT - Atualizar cliente
app.put('/clientes/:id', (req, res) => {
    const { id } = req.params;
    const {
        cpf_cnpj, nome, data_nascimento,
        genero, estado_civil, rg, email, celular
    } = req.body;

    db.run(`
        UPDATE clientes
        SET cpf_cnpj = ?, nome = ?, data_nascimento = ?, genero = ?,
            estado_civil = ?, rg = ?, email = ?, celular = ?
        WHERE id = ?
    `,
    [cpf_cnpj, nome, data_nascimento, genero, estado_civil, rg, email, celular, id],
    function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Cliente atualizado com sucesso!' });
    });
});

// DELETE - Excluir cliente
app.delete('/clientes/:id', (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM clientes WHERE id = ?`, id, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }

        res.json({ message: 'Cliente excluído com sucesso!' });
    });
});

// Iniciar o servidor
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
