document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formCliente");
  const listaClientes = document.getElementById("listaClientes");
  const pagos = document.getElementById("pagos");
  const pendentes = document.getElementById("pendentes");
  const ganhosMes = document.getElementById("ganhosMes");
  const fecharMesBtn = document.getElementById("fecharMes");
  const historicoMensal = document.getElementById("historicoMensal");

  let trabalhos = JSON.parse(localStorage.getItem("trabalhos")) || [];
  let historic = JSON.parse(localStorage.getItem("historic")) || [];

  atualizarTabela();
  atualizarResumo();
  atualizarHistorico();

  // Adicionando novo serviço
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const aparelho = document.getElementById("aparelho").value.trim();
    const data = document.getElementById("data").value;
    const servico = document.getElementById("servico").value.trim();
    const valor = parseFloat(document.getElementById("valor").value);

    if (!aparelho || !data || !servico || isNaN(valor)) {
      alert("Preencha todos os campos corretamente!");
      return;
    }

    const cliente = {
      aparelho,
      data: formatarData(data),
      servico,
      valor,
      status: "Pendente",
    };

    trabalhos.push(cliente);
    salvarLocalStorage();
    atualizarTabela();
    atualizarResumo();
    form.reset();
  });

  // Fechar mês
  fecharMesBtn.addEventListener("click", () => {
    if (trabalhos.length === 0) {
      alert("Não há serviços cadastrados neste mês.");
      return;
    }

    const mesAtual = obterMesAtual();
    const resumoMes = {
      mes: mesAtual,
      clientes: [...trabalhos],
      totalGanho: trabalhos.reduce((acc, c) => (c.status === "Pago" ? acc + c.valor : acc), 0),
    };

    historic.push(resumoMes);
    trabalhos = [];
    salvarLocalStorage();
    atualizarTabela();
    atualizarResumo();
    atualizarHistorico();
    alert(Mês '${mesAtual}' fechado com sucesso!);
  });

  // Atualiza a tabela com os clientes
  function atualizarTabela() {
    listaClientes.innerHTML = "";

    trabalhos.forEach((cliente, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${cliente.aparelho}</td>
        <td>${cliente.data}</td>
        <td>${cliente.servico}</td>
        <td>R$ ${cliente.valor.toFixed(2)}</td>
        <td class="${cliente.status === "Pago" ? "text-success" : "text-warning"}">${cliente.status}</td>
        <td>
          <button class="btn btn-success btn-sm me-2" onclick="alterarStatus(${index})">Marcar como Pago</button>
          <button class="btn btn-danger btn-sm" onclick="removerCliente(${index})">Excluir</button>
        </td>
      `;
      listaClientes.appendChild(tr);
    });
  }

  // Atualiza os resumos de serviços
  function atualizarResumo() {
    const totalPagos = trabalhos.filter((c) => c.status === "Pago").length;
    const totalPendentes = trabalhos.filter((c) => c.status === "Pendente").length;
    const totalGanhos = trabalhos.reduce((acc, c) => (c.status === "Pago" ? acc + c.valor : acc), 0);

    pagos.textContent = totalPagos;
    pendentes.textContent = totalPendentes;
    ganhosMes.textContent = R$ ${totalGanhos.toFixed(2)};
  }

  // Atualiza o histórico mensal
  function atualizarHistorico() {
    historicoMensal.innerHTML = "";

    historic.forEach((mes) => {
      const div = document.createElement("div");
      div.classList.add("mb-4");
      div.innerHTML = `
        <h5 class="text-primary">Mês: ${mes.mes}</h5>
        <p>Total Ganho: R$ ${mes.totalGanho.toFixed(2)}</p>
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Aparelho</th>
              <th>Data</th>
              <th>Serviço</th>
              <th>Valor (R$)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${mes.clientes
              .map(
                (c) => `
              <tr>
                <td>${c.aparelho}</td>
                <td>${c.data}</td>
                <td>${c.servico}</td>
                <td>R$ ${c.valor.toFixed(2)}</td>
                <td class="${c.status === "Pago" ? "text-success" : "text-warning"}">${c.status}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `;
      historicoMensal.appendChild(div);
    });
  }

  // Alterar status do cliente
  window.alterarStatus = function (index) {
    trabalhos[index].status = "Pago";
    salvarLocalStorage();
    atualizarTabela();
    atualizarResumo();
  };

  // Remover cliente
  window.removerCliente = function (index) {
    trabalhos.splice(index, 1);
    salvarLocalStorage();
    atualizarTabela();
    atualizarResumo();
  };

  // Salvar no localStorage
  function salvarLocalStorage() {
    localStorage.setItem("trabalhos", JSON.stringify(trabalhos));
    localStorage.setItem("historic", JSON.stringify(historic));
  }

  // Formatar a data para o padrão brasileiro
  function formatarData(data) {
    const [ano, mes, dia] = data.split("-");
    return ${dia}/${mes}/${ano};
  }

  // Obter o mês atual
  function obterMesAtual() {
    const hoje = new Date();
    const mes = hoje.toLocaleString("pt-BR", { month: "long" });
    const ano = hoje.getFullYear();
    return ${mes} ${ano};
  }
});
