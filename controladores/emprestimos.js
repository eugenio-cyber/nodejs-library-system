const conexao = require("../conexao");

const dadosObrigatorios = async (req, res, usuario_id, livro_id) => {
  if (!usuario_id || !livro_id) {
    return res.status(400).json("O id do usuario e do livro são obrigatórios.");
  }
};

const listarEmprestimos = async (req, res) => {
  try {
    const { rows: listagem } = await conexao.query(
      "select emp.id, usu.nome as usuario, usu.telefone, usu.email, liv.nome as livro, emp.status from emprestimos as emp join usuarios as usu on usu.id = emp.usuario_id join livros as liv on liv.id = emp.livro_id"
    );

    return res.status(200).json(listagem);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const obterEmprestimo = async (req, res) => {
  const { id } = req.params;
  try {
    const emprestimo = await conexao.query(
      "select * from emprestimos where id = $1",
      [id]
    );

    if (emprestimo.rowCount === 0) {
      return res.status(404).json("Emprestimo não encontrado");
    }

    const { rows: listagem } = await conexao.query(
      "select emp.id, usu.nome as usuario, usu.telefone, usu.email, liv.nome as livro, emp.status from emprestimos as emp join usuarios as usu on usu.id = emp.usuario_id join livros as liv on liv.id = emp.livro_id"
    );

    return res.status(200).json(listagem);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const cadastrarEmprestimo = async (req, res) => {
  const { usuario_id, livro_id, status } = req.body;

  dadosObrigatorios(req, res, usuario_id, livro_id);

  try {
    const query =
      "insert into emprestimos (usuario_id, livro_id, status) values ($1, $2, $3)";
    const emprestimo = await conexao.query(query, [
      usuario_id,
      livro_id,
      status,
    ]);

    if (emprestimo.rowCount === 0) {
      return res.status(400).json("Não foi possivel cadastrar o emprestimo");
    }

    return res.status(200).json("Emprestimo cadastrado com sucesso.");
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const atualizarEmprestimo = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json("O status é um campo obrigatório.");
  }

  try {
    const emprestimo = await conexao.query(
      "select * from emprestimos where id = $1",
      [id]
    );

    if (emprestimo.rowCount === 0) {
      return res.status(404).json("Emprestimo não encontrado");
    }

    const query = "update emprestimos set status = $1 where id = $2";
    const emprestimoAtualizado = await conexao.query(query, [status, id]);

    if (emprestimoAtualizado.rowCount === 0) {
      return res.status(404).json("Não foi possível atualizar o emprestimo");
    }

    return res.status(200).json("Emprestimo foi atualizado com sucesso.");
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const excluirEmprestimo = async (req, res) => {
  const { id } = req.params;

  try {
    const emprestimo = await conexao.query(
      "select * from emprestimos where id = $1",
      [id]
    );

    if (emprestimo.rowCount === 0) {
      return res.status(404).json("Emprestimo não encontrado");
    }

    const query = "delete from emprestimos where id = $1";
    const emprestimoExcluido = await conexao.query(query, [id]);

    if (emprestimoExcluido.rowCount === 0) {
      return res.status(404).json("Não foi possível excluir o emprestimo");
    }

    return res.status(200).json("Emprestimo foi excluido com sucesso.");
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

module.exports = {
  listarEmprestimos,
  obterEmprestimo,
  cadastrarEmprestimo,
  atualizarEmprestimo,
  excluirEmprestimo,
};
