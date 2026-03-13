const botao = document.getElementById("botao")
const versiculoDiv = document.getElementById("versiculo")
const referenciaDiv = document.getElementById("referencia")

let vozes = []
let falando = false

// carregar vozes corretamente no celular
function carregarVozes(){
    vozes = speechSynthesis.getVoices()
}

carregarVozes()
speechSynthesis.onvoiceschanged = carregarVozes

botao.addEventListener("click", gerarVersiculo)

async function gerarVersiculo(){

if(falando){
speechSynthesis.cancel()
}

botao.disabled = true

try{

const resposta = await fetch("https://bible-api.com/?random=verse&translation=almeida")

const dados = await resposta.json()

referenciaDiv.innerText = dados.reference

mostrarVersiculo(dados.text)

falarVersiculo(dados.text)

}catch(err){

versiculoDiv.innerText = "Erro ao carregar versículo."

botao.disabled = false

}

}

function mostrarVersiculo(texto){

versiculoDiv.innerHTML = ""

const palavras = texto.split(" ")

palavras.forEach((p,i)=>{

const span = document.createElement("span")

span.textContent = p + " "

span.classList.add("palavra")

span.id = "p"+i

versiculoDiv.appendChild(span)

})

}

function falarVersiculo(texto){

falando = true

const msg = new SpeechSynthesisUtterance(texto)

msg.lang = "pt-BR"
msg.rate = 0.9
msg.pitch = 1

// escolher voz portuguesa
const vozPt = vozes.find(v => v.lang.includes("pt"))

if(vozPt){
msg.voice = vozPt
}

const palavras = texto.split(" ")
let indice = 0

msg.onboundary = function(event){

if(event.name === "word"){

const palavraAtual = document.getElementById("p"+indice)

if(palavraAtual){

// remover destaque anterior
document.querySelectorAll(".ativa").forEach(el=>{
el.classList.remove("ativa")
})

palavraAtual.classList.add("ativa")

}

indice++

}

}

msg.onend = function(){

falando = false
botao.disabled = false

}

speechSynthesis.cancel()

setTimeout(()=>{

speechSynthesis.speak(msg)

},100)

}

function marcarPalavras(texto){

const palavras = texto.split(" ")

let i = 0

const intervalo = setInterval(()=>{

const atual = document.getElementById("p"+i)

if(atual){
atual.classList.add("ativa")
}

i++

if(i >= palavras.length){
clearInterval(intervalo)
}

},450)

}