document.addEventListener("DOMContentLoaded", function () {
  let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  let anotacoes = JSON.parse(localStorage.getItem("anotacoes")) || [];

  const formLogin = document.getElementById("form-login");

  if (formLogin) {
    formLogin.addEventListener("submit", function (event) {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const senha = document.getElementById("senha").value;

      const USUARIO_VALIDO = "pedrofilhoadv2025@gmail.com";
      const SENHA_VALIDA = "Prps@199825";

      if (email === USUARIO_VALIDO && senha === SENHA_VALIDA) {
        document.getElementById("tela-login").style.display = "none";
        document.getElementById("tela-dashboard").style.display = "block";
        renderizarTudo();
      } else {
        alert("E-mail ou senha incorretos!");
      }
    });
  }

  window.fazerLogout = function () {
    document.getElementById("tela-dashboard").style.display = "none";
    document.getElementById("tela-login").style.display = "flex";
    document.getElementById("email").value = "";
    document.getElementById("senha").value = "";
  };

  window.openModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "flex";
  };

  window.closeModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "none";
  };

  function salvarLocalStorage() {
    localStorage.setItem("clientes", JSON.stringify(clientes));
    localStorage.setItem("anotacoes", JSON.stringify(anotacoes));
  }

  function renderizarTudo() {
    renderizarClientes();
    renderizarAnotacoes();
  }

  function renderizarClientes() {
    const tbody = document.getElementById("lista-clientes");
    tbody.innerHTML = "";

    clientes.forEach((cliente, index) => {
      tbody.innerHTML += `
        <tr>
          <td>${cliente.nome}</td>
          <td>${cliente.cpf}</td>
          <td>${cliente.tel || "-"}</td>
          <td><button class="btn-remove" onclick="removerCliente(${index})">Excluir</button></td>
        </tr>`;
    });

    document.getElementById("count-clientes").innerText = clientes.length;
  }

  function renderizarAnotacoes() {
    const grid = document.getElementById("lista-anotacoes");
    grid.innerHTML = "";

    anotacoes.forEach((anotacao, index) => {
      grid.innerHTML += `
        <div class="note-card">
          <div class="note-header">
            <h4>Cliente: ${anotacao.cliente}</h4>
            <button class="btn-remove-sm" onclick="removerAnotacao(${index})">Excluir</button>
          </div>
          <p>${anotacao.texto}</p>
        </div>`;
    });

    document.getElementById("count-anotacoes").innerText = anotacoes.length;
  }

  window.salvarCliente = function () {
    const nome = document.getElementById("cli-nome").value.trim();
    const cpf = document.getElementById("cli-cpf").value.trim();
    const tel = document.getElementById("cli-tel").value.trim();

    if (nome && cpf) {
      clientes.push({ nome, cpf, tel });
      salvarLocalStorage();
      renderizarClientes();

      document.getElementById("cli-nome").value = "";
      document.getElementById("cli-cpf").value = "";
      document.getElementById("cli-tel").value = "";
      closeModal("modal-cliente");
    } else {
      alert("Preencha pelo menos Nome e CPF.");
    }
  };

  window.removerCliente = function (index) {
    if (confirm("Tem certeza que deseja remover este cliente?")) {
      clientes.splice(index, 1);
      salvarLocalStorage();
      renderizarClientes();
    }
  };

  window.salvarAnotacao = function () {
    const cliente = document.getElementById("anot-cliente").value.trim();
    const texto = document.getElementById("anot-texto").value.trim();

    if (cliente && texto) {
      anotacoes.unshift({ cliente, texto });
      salvarLocalStorage();
      renderizarAnotacoes();

      document.getElementById("anot-cliente").value = "";
      document.getElementById("anot-texto").value = "";
      closeModal("modal-anotacao");
    } else {
      alert("Preencha o nome do cliente e a anotação.");
    }
  };

  window.removerAnotacao = function (index) {
    if (confirm("Tem certeza que deseja remover esta anotação?")) {
      anotacoes.splice(index, 1);
      salvarLocalStorage();
      renderizarAnotacoes();
    }
  };

  window.filtrarClientes = function () {
    const filtro = document.getElementById("input-busca").value.toLowerCase();
    const linhas = document.querySelectorAll("#lista-clientes tr");

    linhas.forEach((linha) => {
      const texto = linha.innerText.toLowerCase();
      linha.style.display = texto.includes(filtro) ? "" : "none";
    });
  };
});