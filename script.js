const SUPABASE_URL = "https://qiwvwczvotbridtbwnzh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpd3Z3Y3p2b3RicmlkdGJ3bnpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MzE4ODksImV4cCI6MjEwNDIwNzg4OX0.Hd09Lb1RdCs0dAjJ1DmOTIFp2G41LqvsxiscvBzsy40";
const BUCKET_ANEXOS = "documentos-anotacoes";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", function () {
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

  async function renderizarTudo() {
    await renderizarClientes();
    await renderizarAnotacoes();
  }

  async function renderizarClientes() {
    const tbody = document.getElementById("lista-clientes");
    tbody.innerHTML = "";

    const { data, error } = await supabaseClient
      .from("clientes")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) {
      alert("Erro ao carregar clientes: " + error.message);
      return;
    }

    data.forEach((cliente) => {
      tbody.innerHTML += `
        <tr>
          <td>${cliente.nome}</td>
          <td>${cliente.cpf}</td>
          <td>${cliente.telefone || "-"}</td>
          <td><button class="btn-remove" onclick="removerCliente('${cliente.id}')">Excluir</button></td>
        </tr>`;
    });

    document.getElementById("count-clientes").innerText = data.length;
  }

  async function renderizarAnotacoes() {
    const grid = document.getElementById("lista-anotacoes");
    grid.innerHTML = "";

    const { data, error } = await supabaseClient
      .from("anotacoes")
      .select("*, anexos(*)")
      .order("criado_em", { ascending: false });

    if (error) {
      alert("Erro ao carregar anotações: " + error.message);
      return;
    }

    data.forEach((anotacao) => {
      const anexosHtml = (anotacao.anexos || [])
        .map((anexo) => {
          const { data: urlData } = supabaseClient.storage
            .from(BUCKET_ANEXOS)
            .getPublicUrl(anexo.caminho_arquivo);
          return `<li><a href="${urlData.publicUrl}" target="_blank" rel="noopener">${anexo.nome_arquivo}</a></li>`;
        })
        .join("");

      grid.innerHTML += `
        <div class="note-card">
          <div class="note-header">
            <h4>Cliente: ${anotacao.cliente}</h4>
            <button class="btn-remove-sm" onclick="removerAnotacao('${anotacao.id}')">Excluir</button>
          </div>
          <p>${anotacao.texto}</p>
          ${anexosHtml ? `<ul class="attachment-list">${anexosHtml}</ul>` : ""}
        </div>`;
    });

    document.getElementById("count-anotacoes").innerText = data.length;
  }

  window.salvarCliente = async function () {
    const nome = document.getElementById("cli-nome").value.trim();
    const cpf = document.getElementById("cli-cpf").value.trim();
    const telefone = document.getElementById("cli-tel").value.trim();

    if (!nome || !cpf) {
      alert("Preencha pelo menos Nome e CPF.");
      return;
    }

    const { error } = await supabaseClient.from("clientes").insert([{ nome, cpf, telefone }]);

    if (error) {
      alert("Erro ao salvar cliente: " + error.message);
      return;
    }

    document.getElementById("cli-nome").value = "";
    document.getElementById("cli-cpf").value = "";
    document.getElementById("cli-tel").value = "";
    closeModal("modal-cliente");
    await renderizarClientes();
  };

  window.removerCliente = async function (id) {
    if (!confirm("Tem certeza que deseja remover este cliente?")) return;

    const { error } = await supabaseClient.from("clientes").delete().eq("id", id);

    if (error) {
      alert("Erro ao remover cliente: " + error.message);
      return;
    }

    await renderizarClientes();
  };

  window.salvarAnotacao = async function () {
    const cliente = document.getElementById("anot-cliente").value.trim();
    const texto = document.getElementById("anot-texto").value.trim();
    const arquivos = document.getElementById("anot-arquivos").files;

    if (!cliente || !texto) {
      alert("Preencha o nome do cliente e a anotação.");
      return;
    }

    const { data: anotacaoData, error: anotacaoError } = await supabaseClient
      .from("anotacoes")
      .insert([{ cliente, texto }])
      .select()
      .single();

    if (anotacaoError) {
      alert("Erro ao salvar anotação: " + anotacaoError.message);
      return;
    }

    for (const arquivo of arquivos) {
      const caminho = `${anotacaoData.id}/${Date.now()}-${arquivo.name}`;

      const { error: uploadError } = await supabaseClient.storage
        .from(BUCKET_ANEXOS)
        .upload(caminho, arquivo);

      if (uploadError) {
        alert("Erro ao enviar arquivo " + arquivo.name + ": " + uploadError.message);
        continue;
      }

      const { error: anexoError } = await supabaseClient.from("anexos").insert([
        {
          anotacao_id: anotacaoData.id,
          nome_arquivo: arquivo.name,
          caminho_arquivo: caminho,
        },
      ]);

      if (anexoError) {
        alert("Erro ao registrar anexo " + arquivo.name + ": " + anexoError.message);
      }
    }

    document.getElementById("anot-cliente").value = "";
    document.getElementById("anot-texto").value = "";
    document.getElementById("anot-arquivos").value = "";
    closeModal("modal-anotacao");
    await renderizarAnotacoes();
  };

  window.removerAnotacao = async function (id) {
    if (!confirm("Tem certeza que deseja remover esta anotação?")) return;

    const { data: anexos, error: anexosError } = await supabaseClient
      .from("anexos")
      .select("*")
      .eq("anotacao_id", id);

    if (anexosError) {
      alert("Erro ao verificar anexos: " + anexosError.message);
      return;
    }

    if (anexos.length > 0) {
      const caminhos = anexos.map((anexo) => anexo.caminho_arquivo);
      await supabaseClient.storage.from(BUCKET_ANEXOS).remove(caminhos);
    }

    const { error } = await supabaseClient.from("anotacoes").delete().eq("id", id);

    if (error) {
      alert("Erro ao remover anotação: " + error.message);
      return;
    }

    await renderizarAnotacoes();
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
