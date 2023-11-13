let count_rows = 1;
let tensaoProva = 0;

function init() {
  eel.init();
}

function onChangeSelect(id) {
  let value = document.getElementById(id).value;
  if (id == "selecioneParafuso") {
    value = value.replace("M", "");
  } else if (id == "selecioneClasseMetrica") {
    // const parafuso = document.getElementById(`selecioneParafuso`).value.replace("M", "");
    // value = [parafuso, value]
  } else if (id == "selecioneObjetivo") {
    changeByObjetivoCarregamento(value);
    return;
  } else if (id == "selecioneTipoCarregamento") {
    changeAreaForcas(value);
    return;
  } else if (id == "selecioneClasseMetrica") {
    return;
  } else if (id == 'pre-tensao'){
    const msg = validarTipoNumber(document.getElementById(id));
    if (msg.length) return (mensagemErro(msg));
    value = parseFloat(value);
    if (value>100) return (mensagemErro(['% Pré-Tensao: Coloque um valor entre 0 e 100']));
    setForcaPreCarga(value/100);
  return
  }

  eel.onChange(id, value);
}

function setForcaPreCarga(value){
  let forcaPreCarga = document.getElementById('forca-pre-carga'); 
  let limiteEscoamento = document.getElementById('sesc').value;
  forcaPreCarga.value = value * limiteEscoamento;
}

function changeAreaForcas(value) {
  let areaRow = document.getElementById("areaTensaoRow");
  let areaField = document.getElementById("areaTensao");

  switch (value) {
    case "tensao":
      areaRow.style.visibility = "";
      areaField.classList.remove("notImportant");
      break;
    default:
      areaRow.style.visibility = "hidden";
      areaField.classList.add("notImportant");
      break;
  }
}

function closeWindow() {
  window.close();
  eel.close();
}

function setDisplayMensagens(idMsg, flag) {
  const blockScreen = document.getElementById("block-screen");
  const msg = document.querySelector(`[id^="${idMsg}"]`);
  if (flag) {
    msg.style.display = "";
    blockScreen.style.display = "";
  } else {
    msg.style.display = "none";
    blockScreen.style.display = "none";
  }
}

function exportRelatorio() {
  setDisplayMensagens("export", false);
  setDisplayMensagens("export-ok", true);
}

function reiniciarProcesso(tag) {
  setDisplayMensagens(tag, false);
  reboot_btn();
}

function getValues() {
  const comprimento = getComprimento();
  let dict = {
    screw: document.getElementById(`selecioneParafuso`).value.replace("M", ""),
    pitch: document.getElementById(`selecionePasso`).value,
    elasticity: document.getElementById(`elasticidadeDoParafuso`).value,
    alturaPorca: document.getElementById(`alturaPorca`).value,
    quantidadePorca: document.getElementById(`quantidadePorca`).value,
    alturaArruela: document.getElementById(`alturaArruela`).value,
    quantidadeArruela: document.getElementById(`quantidadeArruela`).value,
    alturaTotalChapas: document.getElementById(`alturaTotalChapas`).value,
    a_t: document.getElementById(`a_t`).value,
    a_d: document.getElementById(`a_d`).value,
    comprimentoParafuso: comprimento,
  };
  return dict;
}

function mensagemErro(values) {
  if (!values.length) return;
  const msgErro = document.getElementById(`erroMsg`);
  msgErro.innerHTML = values.join(", ");
  setDisplayMensagens("erro", true);
}

function mensagem_sucesso(value) {
  // alert(`Preencha o campo: ${value}.`)
}

function calculeComprimentoParafuso() {
  dict = getValues();
  eel.comprimento_parafuso(dict);
}

function calculeRigidezParafuso() {
  dict = getValues();
  eel.rigidez_parafuso(dict);
}

function renameCabecalho() {
  const tooltip = document.querySelector("*.active span.tooltiptext");
  tooltiptext = tooltip.innerHTML;
  const list = document.querySelector("*.active li");
  tooltip.innerText = list.innerText;
  list.innerText = tooltiptext;
}

function changeReadOnly() {
  let checkBox = document.getElementById("alterL");
  let box = document.getElementById("newValor");
  if (checkBox.checked == true) {
    box.style.visibility = "visible";
    document.getElementById("novoComprimento").focus();
  } else {
    box.style.visibility = "hidden";
  }
}

function checkProgressBar() {
  const total = parseFloat(document.querySelector("#alturaTotalChapas").value);
  const espessuras = document.querySelectorAll('[id^="Deep-"]');
  let parcial = 0;
  for (const e of espessuras) {
    try {
      valor = parseFloat(e.value);
    } catch {
      mensagemErro(validarTipoNumber(e));
      e.value = 0;
      return;
    }
    if (e.value == "") valor = 0;
    parcial += valor;
    if (parcial > total) {
      mensagemErro([
        `Valor informado foi superior ao valor total (${total}mm) pré-defenido.`,
      ]);
      e.value = 0;
      return;
    }
  }
  return parcial < total
    ? // ? [`O valor total esperado é de ${total}mm e o valor atual é de ${parcial}mm`]
      [`Adicione mais ${total - parcial}mm para completar o total de espessura`]
    : [];
}

function updateProgressBar() {
  const total = parseFloat(document.querySelector("#alturaTotalChapas").value);
  const espessuras = document.querySelectorAll('[id^="Deep-"]');
  let parcial = 0;
  for (e of espessuras) {
    try {
      valor = parseFloat(e.value);
    } catch {
      mensagemErro(validarTipoNumber(e));
      e.value = 0;
      return;
    }
    if (e.value == "") valor = 0;
    parcial += valor;
    if (parcial > total) {
      mensagemErro([
        `Valor informado foi superior ao valor total (${total}mm) pré-defenido.`,
      ]);
      e.value = 0;
      return;
    }
  }

  const bar = document.getElementById("myBar");

  bar.style.height = `${(parcial / total) * 100}%`;
}

function add_row() {
  let rows = document.querySelectorAll(".rigidez-materiais-table tr").length;
  if (rows > 10) return;
  let table = document.querySelector("tbody.rigidez-materiais-table");
  let row = document.createElement("tr");
  // N
  let data = document.createElement("td");
  data.innerHTML = count_rows;
  data.id = `N-${count_rows}`;
  row.appendChild(data);

  // Espessura
  let data2 = document.createElement("td");
  let text = document.createElement("input");
  text.id = `Deep-${count_rows}`;
  text.placeholder = 10.5;
  text.type = "number";
  text.classList.add("no-number");
  data2.appendChild(text);
  data2.oninput = function () {
    updateProgressBar();
  };
  row.appendChild(data2);

  // material
  data = document.createElement("td");
  let select = document.createElement("select");
  let mat = `selecioneMaterial`;
  select.id = `${mat}-${count_rows}`;
  let mat_2 = count_rows;
  select.onchange = function () {
    fill_module_e(mat_2, mat);
  };
  data.appendChild(select);
  row.appendChild(data);

  // modulo E
  let data3 = document.createElement("td");
  text = document.createElement("input");
  text.type = "text";
  text.id = `ModuleE-${count_rows}`;
  text.type = "number";
  text.classList.add("no-number");
  data3.appendChild(text);

  row.appendChild(data3);

  table.appendChild(row);
  eel.fill_table(count_rows);
  count_rows++;
}

function criarTabelaConeDeformacao(tableInfo) {
  let rowsQuantidade = document.querySelectorAll(
    ".cone-deformacao-table tr"
  ).length;
  if (rowsQuantidade > 1) {
    for (let i=0; i < rowsQuantidade; i++) {
      document.querySelector(".cone-deformacao-table tr:last-child").remove();
    }
  }
  totalRows = 1;
  for ([n, elasticidade, dw, t, kchapa] of tableInfo) {
    let table = document.querySelector("tbody.cone-deformacao-table");
    let row = document.createElement("tr");
    // Cone
    let data = document.createElement("td");
    data.innerHTML = totalRows;
    data.id = `Cone-${totalRows}`;
    row.appendChild(data);

    // Diametro
    let data2 = document.createElement("td");
    data2.innerHTML = dw;
    data2.id = `Diametro-${totalRows}`;
    row.appendChild(data2);

    // espessura (t)
    let data3 = document.createElement("td");
    data3.innerHTML = t;
    data3.id = `Espessura-${totalRows}`;
    row.appendChild(data3);

    // Modulo E (N/mm2)
    let data4 = document.createElement("td");
    data4.innerHTML = elasticidade;
    data4.id = `Modulo-${totalRows}`;
    row.appendChild(data4);

    // K (N/mm)
    let data5 = document.createElement("td");
    data5.innerHTML = kchapa;
    data5.id = `k-${totalRows}`;
    row.appendChild(data5);

    table.appendChild(row);
    totalRows++;
  }
}

function getArea() {
  const carregamento = document.getElementById(`selecioneTipoCarregamento`).value;
  const area = document.getElementById(`areaTensao`).value;
  const areaTracao = document.getElementById(`a_t`).value;
  return (carregamento=='forca')?areaTracao : area;
}

function getPreCarga() {
  let preTensao = document.getElementById(`pre-tensao`).value;
  preTensao = (!preTensao) ? 90 : parseFloat(preTensao);
  preTensao = preTensao/100;
  const areaT = parseFloat(document.getElementById(`a_t`).value);
  const tensaoProva = parseFloat(document.getElementById(`tensao-prova`).value);
  let preCarga = preTensao * tensaoProva * areaT;
  document.getElementById("forca-pre-carga").value = preCarga;
  return preTensao * tensaoProva;
}



function getCriteriosProjeto() {
  let objetivo = document.getElementById('selecioneObjetivo').value;
  let area = getArea();
  let tensaoPreCarga = getPreCarga()

  let dict = {
    qtdParafuso: document.getElementById(`qtdParafuso`).value.replace("M", ""),
    escoamento: document.getElementById(`sesc`).value,
    ruptura: document.getElementById(`sruptura`).value,
    forcaMax: document.getElementById(`forcaMax`).value,
    forcaMin: document.getElementById(`forcaMin`).value,
    csJunta: document.getElementById(`cs-junta`).value,
    csFadiga: document.getElementById(`cs-fadiga`).value,
    classe: document.getElementById(`selecioneClasseMetrica`).value,
    c_p: document.getElementById(`c_p`).value,
    pre_carga: document.getElementById(`forca-pre-carga`).value,
    area: area,
    objetivo: objetivo,
    tensao_pre_carga:tensaoPreCarga
  };

  if (objetivo=="checar-cs-local" | objetivo=="max-local") {
    document.getElementById("table-criterios").style.visibility="hidden"
  } else{
    document.getElementById("table-criterios").style.visibility=""
  }

  eel.validar_criterios(dict)
}


function criarTabelaCriteriosProjeto(tableInfo, type) {
  let rowsQuantidade = document.querySelectorAll(
    ".criterios-projeto-table tr"
  ).length;
  if (rowsQuantidade > 1) {
    for (let i=0; i < rowsQuantidade; i++) {
      document.querySelector(".criterios-projeto-table tr:last-child").remove();
    }
  }

  let th = document.getElementById("typeTableCriterio");
  th.innerHTML = (type=='fmax')? 'F<sub>max</sub> (N)': 'CS (-)';
 

  totalRows = 1;
  for ([[criterio, value, media, alternada]] of tableInfo) {
    let table = document.querySelector("tbody.criterios-projeto-table");
    let row = document.createElement("tr");

    // Nome do Criterio de falha
    let data = document.createElement("td");
    data.innerHTML = criterio;
    data.id = `Criterio-${totalRows}`;
    row.appendChild(data);

    // Fmax ou CS
    let data2 = document.createElement("td");
    data2.innerHTML = value;
    data2.id = `Info-${totalRows}`;
    row.appendChild(data2);

    // Tensao Media 
    let data3 = document.createElement("td");
    data3.innerHTML = media;
    data3.id = `TensaoMedia-${totalRows}`;
    row.appendChild(data3);

    // Tensao Alternada
    let data4 = document.createElement("td");
    data4.innerHTML = alternada;
    data4.id = `TensaoAlternada-${totalRows}`;
    row.appendChild(data4);

    // // K (N/mm)
    // let data5 = document.createElement("td");
    // data5.innerHTML = kchapa;
    // data5.id = `k-${totalRows}`;
    // row.appendChild(data5);

    table.appendChild(row);
    totalRows++;
  }

}


function delete_row() {
  let rows = document.querySelectorAll(".rigidez-materiais-table tr").length;
  if (rows <= 2) return;
  document.querySelector(".rigidez-materiais-table tr:last-child").remove();
  count_rows--;
}

function fill_module_e(n, partial_id) {
  let id = `${partial_id}-${n}`;
  let value = document.getElementById(id).value;
  eel.filter_elasticity(n, value);
}

function getRigidezgMaterialsValues() {
  let dict = {
    screw: document.getElementById(`selecioneParafuso`).value.replace("M", ""),
    alturaTotalChapas: document.getElementById(`alturaTotalChapas`).value,
    kp: document.getElementById(`kp`).value,
  };
  return dict;
}

function calculeRigidezMateriais() {
  let qtd_trs = document.querySelectorAll(".rigidez-materiais-table tr");
  console.log(qtd_trs);
  let values = getRigidezgMaterialsValues();
  let list = [];
  for (let j = 1; j < qtd_trs.length; j++) {
    console.log("j", j);
    let id = `Deep-${j}`;
    let id_e = `ModuleE-${j}`;
    let t = document.getElementById(id);
    console.log(t.value);
    let k = document.getElementById(id_e);
    console.log(k.value);
    list.push([j, t.value, k.value]);
  }
  values["table"] = list;
  eel.rigidez_materials(values);
}

function changeByObjetivoCarregamento(value) {
  let preTensao = document.getElementById("pre-tensao");
  let preTensaoSpam = document.getElementById("pre-tensaoSpamRow");
  let forcaPreCarga = document.getElementById("forca-pre-cargaRow");
  let forcaMax = document.getElementById("forcaMaxRow");
  let forcaMaxSpam = document.getElementById("forcaMaxSpamRow");
  let forcaMin = document.getElementById("forcaMinRow");
  let forcaMinSpam = document.getElementById("forcaMinSpamRow");
  let csJunta = document.getElementById("cs-junta");
  let csJuntaRow = document.getElementById("cs-juntaRow");
  let csFadigaRow = document.getElementById("cs-fadigaRow");
  let csFadiga = document.getElementById("cs-fadiga");

  // preTensao.style.visibility = 'hidden';
  // forcaPreCarga.style.visibility = 'hidden';
  forcaMax.style.visibility = "hidden";
  forcaMaxSpam.style.visibility = "hidden";
  forcaMin.style.visibility = "hidden";
  forcaMinSpam.style.visibility = "hidden";
  csFadiga.style.visibility = "hidden";
  csFadigaRow.style.visibility = "hidden";
  csJunta.style.visibility = "hidden";
  csJuntaRow.style.visibility = "hidden";
  forcaMax.classList.add("notImportant");
  forcaMaxSpam.classList.add("notImportant");
  forcaMin.classList.add("notImportant");
  forcaMinSpam.classList.add("notImportant");
  csFadiga.classList.add("notImportant");
  csFadigaRow.classList.add("notImportant");
  csJunta.classList.add("notImportant");
  csJuntaRow.classList.add("notImportant");

  switch (value) {
    case "checar-cs-local":
      forcaMax.style.visibility = "";
      forcaMaxSpam.style.visibility = "";
      forcaMax.classList.remove("notImportant");
      forcaMaxSpam.classList.remove("notImportant");
      break;
    case "checar-cs":
      forcaMax.style.visibility = "";
      forcaMaxSpam.style.visibility = "";
      forcaMin.style.visibility = "";
      forcaMinSpam.style.visibility = "";
      forcaMax.classList.remove("notImportant");
      forcaMaxSpam.classList.remove("notImportant");
      forcaMin.classList.remove("notImportant");
      forcaMinSpam.classList.remove("notImportant");
      break;
    case "max-local":
      csJunta.style.visibility = "";
      csJuntaRow.style.visibility = "";
      csJunta.classList.remove("notImportant");
      csJuntaRow.classList.remove("notImportant");
      break;
    case "max-local-flutuante":
      csJunta.style.visibility = "";
      csJuntaRow.style.visibility = "";
      csFadiga.style.visibility = "";
      csFadigaRow.style.visibility = "";
      forcaMin.style.visibility = "";
      forcaMinSpam.style.visibility = "";
      forcaMin.classList.remove("notImportant");
      forcaMinSpam.classList.remove("notImportant");
      csFadiga.classList.remove("notImportant");
      csFadigaRow.classList.remove("notImportant");
      csJunta.classList.remove("notImportant");
      csJuntaRow.classList.remove("notImportant");
      break;
  }
}

function callPythonByObjetivo() {
  let value = document.getElementById("selecioneObjetivo").value;
  let preTensao = document.getElementById("pre-tensao").value;
  preTensao = !preTensao.length ? 90 : preTensao;

  let preTensaoSpam = document.getElementById("pre-tensaoSpamRow");
  let forcaPreCarga = document.getElementById("forca-pre-cargaRow");
  let forcaMax = document.getElementById("forcaMaxRow");
  let forcaMaxSpam = document.getElementById("forcaMaxSpamRow");
  let forcaMin = document.getElementById("forcaMinRow");
  let forcaMinSpam = document.getElementById("forcaMinSpamRow");
  let csJunta = document.getElementById("cs-juntaRow");
  let csFadiga = document.getElementById("cs-fadigaRow");

  // preTensao.style.visibility = 'hidden';
  // forcaPreCarga.style.visibility = 'hidden';
  forcaMax.style.visibility = "hidden";
  forcaMaxSpam.style.visibility = "hidden";
  forcaMin.style.visibility = "hidden";
  forcaMinSpam.style.visibility = "hidden";
  csFadiga.style.visibility = "hidden";
  csJunta.style.visibility = "hidden";
}

let item = document.getElementsByClassName("item");
let content = document.getElementsByClassName("content");
let next = document.getElementById("next");
let back = document.getElementById("back");
let one = document.getElementsByClassName("one")[0];
let two = document.getElementsByClassName("two")[0];
let three = document.getElementsByClassName("three")[0];
let four = document.getElementsByClassName("four")[0];
let five = document.getElementsByClassName("five")[0];
let six = document.getElementsByClassName("six")[0];
let seven = document.getElementsByClassName("seven")[0];
let eight = document.getElementsByClassName("eight")[0];
let count = 1;

for (let i = 0; i < item.length; i++) {
  activeItem = item[i];
  if (!i) {
    activeItem.disabled = false;
  } else {
    activeItem.disabled = true;
  }
}

one.addEventListener("click", () => {
  if (one.disabled) return;
  showContent(1);
  count = 1;
  currentContent(count);
  set_btn_next_text(count);
  verifyBackButton();
});

two.addEventListener("click", () => {
  if (two.disabled) return;
  showContent(2);
  count = 2;
  currentContent(count);
  set_btn_next_text(count);
  verifyBackButton();
});

three.addEventListener("click", () => {
  if (three.disabled) return;
  showContent(3);
  count = 3;
  currentContent(count);
  set_btn_next_text(count);
  verifyBackButton();
});

four.addEventListener("click", () => {
  if (four.disabled) return;
  showContent(4);
  count = 4;
  currentContent(count);
  set_btn_next_text(count);
  verifyBackButton();
});

five.addEventListener("click", () => {
  if (five.disabled) return;
  showContent(5);
  count = 5;
  currentContent(count);
  set_btn_next_text(count);
  verifyBackButton();
});

six.addEventListener("click", () => {
  if (six.disabled) return;
  showContent(6);
  count = 6;
  currentContent(count);
  set_btn_next_text(count);
  verifyBackButton();
});

seven.addEventListener("click", () => {
  if (seven.disabled) return;
  showContent(7);
  count = 7;
  currentContent(count);
  set_btn_next_text(count);
  verifyBackButton();
});

eight.addEventListener("click", () => {
  if (eight.disabled) return;
  showContent(8);
  count = 8;
  currentContent(count);
  set_btn_next_text(count);
  verifyBackButton();
});

back.addEventListener("click", () => {
  --count;
  showContent(count);
  set_btn_next_text(count);
  verifyBackButton();
  currentContent(count);
  if (count >= 1) {
    return;
  } else {
    stepperController(count);
  }
});

function reboot_btn() {
  reboot();
  currentContent(count);
  verifyBackButton();
  if (item[2].disabled == false) {
    return;
  } else {
    stepperController(count);
  }
}

function reboot() {
  currentContent(1);
  for (let i = 0; i < item.length; i++) {
    item[i].classList.remove("checkedPage");
  }
  count = 1;
  set_btn_next_text(count);
  showContent(count);
  for (i of item) {
    if (i === item[0]) {
      i.disabled = false;
      item[0].classList.add("active");
    } else {
      i.disabled = true;
    }
    i++;
  }
  limparCampos();
  count_rows = 1;
  init();
}

function limparCampos() {
  document.getElementById(`selecioneParafuso`).value = "";
  document.getElementById(`selecionePasso`).value = "";
  document.getElementById(`elasticidadeDoParafuso`).value = "207";
  document.getElementById(`alturaPorca`).value = "";
  document.getElementById(`quantidadePorca`).value = "1";
  document.getElementById(`alturaArruela`).value = "2";
  document.getElementById(`quantidadeArruela`).value = "2";
  document.getElementById(`alturaTotalChapas`).value = "";
  document.getElementById(`a_t`).value = "";
  document.getElementById(`a_d`).value = "";
  document.getElementById(`comprimentoParafuso`).value = "";
  document.getElementById(`novoComprimento`).value = "";
  document.getElementById(`sesc`).value = "";
  document.getElementById(`sruptura`).value = "";
  document.getElementById(`pre-tensao`).value = "";
  document.getElementById(`tensao-prova`).value = "";
  document.getElementById(`forcaMax`).value = "";
  document.getElementById(`forcaMin`).value = "";
  document.getElementById(`cs-junta`).value = "";
  document.getElementById(`areaTensao`).value = "";
  document.getElementById(`criterio-um`).value = "";
  document.getElementById(`criterio-dois`).value = "";
  document.getElementById(`resultado-criterio`).value = "";
  document.getElementById(`NameAluno`).value = "";
  document.getElementById(`fileName`).value = "";
  document.getElementById(`tituloFile`).value = "";
  document.getElementById(`descricao`).value = "";
  const bar = document.getElementById("myBar");
  bar.style.height = '0%';


  let rows = document.querySelectorAll(".rigidez-materiais-table tr");
  if (rows.length > 1) {
    for (i; i < rows.length; i++) {
      document.querySelector(".rigidez-materiais-table tr:last-child").remove();
    }
  }
}

function getComprimento() {
  const padronizado = document.getElementById(`comprimentoPadronizado`).value;
  const novo = document.getElementById(`novoComprimento`).value;
  if (!novo | (novo == null) | (novo == "0")) {
    return padronizado;
  }
  return novo;
}

function showContent(conteudo) {
  let currentIndex = 1;
  for (c of content) {
    if (conteudo === currentIndex) {
      c.classList.remove("hidden");
    } else {
      c.classList.add("hidden");
    }
    currentIndex++;
  }
}

function stepperController(conteudo) {
  let controller = conteudo - 1;
  for (let i = 0; i < item.length; i++) {
    if (i <= controller) {
      item[i].disabled = false;
    } else {
      item[i].disabled = true;
    }
  }
}

function currentContent(conteudo) {
  const activeBtn = document.querySelector("*.active");
  renameCabecalho();
  activeBtn.classList.remove("active");
  activeBtn.classList.add("checkedPage");

  let controller = conteudo - 1;
  item[controller].classList.add("active");
  item[controller].classList.remove("checkedPage");
  item[controller].disabled = false;
  renameCabecalho();
}

function verifyBackButton() {
  if (count <= 1) {
    back.disabled = true;
  } else {
    back.disabled = false;
  }
}

function checked(id) {
  id--;
  const tag = "checkedPage";
  if (id < 0) return;
  item[id].classList.add(tag);
}

function nextPage() {
  if (count >= item.length) {
    setDisplayMensagens("export", true);
  } else {
    ++count;
    showContent(count);
  }
  currentContent(count);
  verifyBackButton();
}

function fillClassMetrica() {
  changeAreaForcas('forca');
  eel.filter_classe_metrica();
}

function set_btn_next_text(count) {
  let txt;
  let btn_next = document.getElementById("next");
  switch (count) {
    case 1:
      txt = "Calcular Comprimento do Parafuso";
      break;
    case 2:
      txt = "Calcular Rigidez do Parafuso";
      break;
    case 3:
      txt = "Próximo";
      break;
    case 4:
      txt = "Calcular Rigidez Materiais";
      break;
    case 5:
      txt = "Próximo";
      break;
    case 6:
      txt = "Validar Projeto";
      break;
    case 7:
      txt = "Próximo";
      break;
    case 8:
      txt = "Exportar";
      break;
    case 9:
      txt = "Exportar";
      break;
  }
  btn_next.value = txt;
  checked(count - 1);
}

function controllerSystem() {
  errors = validarInputs();
  if (errors.length) {
    mensagemErro(errors);
    return;
  }
  set_btn_next_text(count + 1);
  change_function();
  nextPage();
}

function change_function() {
  switch (count) {
    case 1:
      calculeComprimentoParafuso();
      break;
    case 2:
      calculeRigidezParafuso();
      break;
    case 3:
      add_row();
      break;
    case 4:
      calculeRigidezMateriais();
      break;
    case 5:
      fillClassMetrica();
      break;
    case 6:
      getCriteriosProjeto();
      // callPythonByObjetivo();
      break;
    case 7:
      break;
  }
}

function validarTipoNumber(inp) {
  const msg = [];
  const id = inp.id;
  const value = inp.value;
  const isNotImportante = inp.classList.contains("notImportant");

  if (isNotImportante) return msg;

  if (id == "novoComprimento") {
    let box = document.getElementById("newValor");
    if (box.style.visibility == "hidden") {
      return msg;
    }
  }

  if (!value | (value == null) | (value == "0") | (value == 0)) {
    if (id == "alturaArruela") return msg;
    if (id == "quantidadeArruela") return msg;
    if (id == "forcaMin") return msg;
    if (id == "forcaMax") return msg;
    if (id == "pre-tensao") return msg;
    msg.push(`${id} não pode estar vazio`);
    return msg;
  }
  if (value.includes("-")) msg.push(`${id} é um número negativo`);
  if (value.includes("e")) msg.push(`${id} não é um número`);

  if (id == "quantidadeArruela") {
    value % 2 == 0 ? null : msg.push(`${id}: inserir um número par positivo`);
  }

  // if (id == "sesc") {
  //   let ruptura = document.getElementById("sruptura").value;
  //   parseFloat(value) <= parseFloat(ruptura)
  //     ? null
  //     : msg.push(
  //         `Tensão de Ruptura não pode ser MENOR que o Limite de Escoamento`
  //       );
  // }

  return msg;
}

function validarSelectOne(inp) {
  const msg = [];
  const id = inp.id;
  const value = inp.value;
  if (!value | (value == null) | (value == "0")) {
    msg.push(`${id} não pode estar vazio`);
    return msg;
  }
  const options = document.querySelectorAll(`#${id} option`);
  for (const opt of options) {
    if (opt.value == value) return [];
  }
  msg.push(`${id} contém valor inválido`);
  return msg;
}

function validarInputs() {
  const msg = [];
  const inputs = document.querySelectorAll(
    "section.content:not(.hidden):not(.buttons) input, section.content:not(.hidden):not(.buttons) select"
  );
  // const inputs = document.querySelectorAll(
  //   "section:not(.hidden):not(.buttons) input, section:not(.hidden):not(.buttons) select"
  // );
  const isMembroJunta = document.querySelectorAll(
    "section.content:not(.hidden):not(.buttons) input#delete"
  );
  if (isMembroJunta.length) {
    const msg = checkProgressBar();
    if (msg.length) return msg;
  }

  for (const inp of inputs) {
    let erros = [];
    switch (inp.type) {
      case "text":
        erros = [];
        break;
      case "number":
        erros = validarTipoNumber(inp);
        break;
      case "select-one":
        erros = validarSelectOne(inp);
        break;
      case "button":
        erros = [];
        break;
    }
    if (erros.length) msg.push(...erros);
  }
  return msg;
}


function creatRelatorio(){
    let nome = document.getElementById('NameAluno');
    let file = document.getElementById('fileName');
    let titulo = document.getElementById('tituloFile');
    let descricao = document.getElementById('descricao');

    nome = nome.value ? nome.value: nome.placeholder;
    file = file.value ? file.value: file.placeholder;
    titulo = titulo.value ? titulo.value: titulo.placeholder;
    descricao = descricao.value ? descricao.value: descricao.placeholder;




}