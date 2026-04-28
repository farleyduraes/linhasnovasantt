let dados = [];

// remove acento e deixa minúsculo
function normalizar(texto) {
  return texto
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase() || "";
}

// separa origem/destino
function separarMercado(mercado) {
  if (!mercado) return { origem: "", destino: "" };

  const partes = mercado.split("-");
  return {
    origem: partes[0]?.trim() || "",
    destino: partes[1]?.trim() || ""
  };
}

// recebe dados
onmessage = function(e) {
  const { tipo, payload } = e.data;

  if (tipo === "init") {
    dados = payload.map(d => {
      const { origem, destino } = separarMercado(d.MERCADO);

      const empresa = d.TRANSPORTADORA_CONTEMPLADA_1 || "";
      const cnpj = d.CNPJ_1 || "";

      // 🔥 string única otimizada pra busca
      const busca = normalizar(
        origem + " " + destino + " " + empresa
      );

      return {
        origem,
        destino,
        empresa,
        cnpj,
        busca
      };
    });

    postMessage({ tipo: "ready" });
  }

  if (tipo === "buscar") {
    const termo = normalizar(payload);

    if (termo.length < 2) {
      postMessage({ tipo: "resultado", payload: [] });
      return;
    }

    const resultado = [];

    for (let i = 0; i < dados.length; i++) {
      if (dados[i].busca.includes(termo)) {
        resultado.push(dados[i]);

        // 🔥 corta cedo (muito importante)
        if (resultado.length >= 50) break;
      }
    }

    postMessage({ tipo: "resultado", payload: resultado });
  }
};