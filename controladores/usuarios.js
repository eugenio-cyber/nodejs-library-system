const conexao = require("../conexao");

const dadosObrigatorios = async (req, res, nome, email, cpf) => {
  if (!nome || !email || !cpf) {
    return res
      .status(400)
      .json("Os campos: nome, email e cpf são obrigatórios.");
  }

  const emailBD = await conexao.query(
    "select * from usuarios where email = $1",
    [email]
  );

  const cpfBD = await conexao.query("select * from usuarios where cpf = $1", [
    cpf,
  ]);

  if (emailBD.rowCount !== 0 || cpfBD.rowCount !== 0) {
    return res.status(400).json("Este email ou cpf já está cadastrado");
  }
};

const listarUsuarios = async (req, res) => {
  try {
    const { rows: usuarios } = await conexao.query("select * from usuarios");

    for (const usuario of usuarios) {
      const { rows: emprestimos } = await conexao.query(
        "select * from emprestimos where usuario_id = $1",
        [usuario.id]
      );
      usuario.emprestimos = emprestimos;
    }

    return res.status(200).json(usuarios);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const obterUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await conexao.query(
      "select * from usuarios where id = $1",
      [id]
    );

    const { rows: emprestimos } = await conexao.query(
      "select * from emprestimos where usuario_id = $1",
      [id]
    );

    for (const test of usuario.rows) {
      test.emprestimos = emprestimos;
    }

    if (usuario.rowCount === 0) {
      return res.status(404).json("Usuario não encontrado");
    }

    return res.status(200).json(usuario.rows[0]);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const cadastrarUsuario = async (req, res) => {
  const { nome, idade, telefone, email, cpf } = req.body;

  dadosObrigatorios(req, res, nome, email, cpf);

  try {
    const query =
      "insert into usuarios (nome, idade, telefone, email, cpf) values ($1, $2, $3, $4, $5)";
    const autor = await conexao.query(query, [
      nome,
      idade,
      telefone,
      email,
      cpf,
    ]);

    if (autor.rowCount === 0) {
      return res.status(400).json("Não foi possivel cadastrar o usuario");
    }

    return res.status(200).json("Usuario cadastrado com sucesso.");
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const atualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nome, idade, telefone, email, cpf } = req.body;

  try {
    const usuario = await conexao.query(
      "select * from usuarios where id = $1",
      [id]
    );

    dadosObrigatorios(req, res, nome, email, cpf);

    if (usuario.rowCount === 0) {
      return res.status(404).json("Usuario não encontrado");
    }

    const query =
      "update usuarios set nome = $1, idade = $2, telefone = $3, email = $4, cpf = $5 where id = $6";
    const autorAtualizado = await conexao.query(query, [
      nome,
      idade,
      telefone,
      email,
      cpf,
      id,
    ]);

    if (autorAtualizado.rowCount === 0) {
      return res.status(404).json("Não foi possível atualizar o usuario");
    }

    return res.status(200).json("Usuario foi atualizado com sucesso.");
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const excluirUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await conexao.query(
      "select * from usuarios where id = $1",
      [id]
    );

    if (usuario.rowCount === 0) {
      return res.status(404).json("Usuario não encontrado");
    }

    const emprestimos = await conexao.query(
      "select * from emprestimos where usuario_id = $1",
      [id]
    );

    if (emprestimos.rowCount !== 0) {
      return res
        .status(404)
        .json(
          "Não é possível excluir usuarios que tenham emprestimos atrelados ao seu id"
        );
    }

    const query = "delete from usuarios where id = $1";
    const usuarioExcluido = await conexao.query(query, [id]);

    if (usuarioExcluido.rowCount === 0) {
      return res.status(404).json("Não foi possível excluir o usuario");
    }

    return res.status(200).json("Usuario foi excluido com sucesso.");
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

module.exports = {
  listarUsuarios,
  obterUsuario,
  cadastrarUsuario,
  atualizarUsuario,
  excluirUsuario,
};
