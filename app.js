const botao = document.getElementById("botao")
const botaoSom = document.getElementById("botao-som")
const versiculoDiv = document.getElementById("versiculo")
const referenciaDiv = document.getElementById("referencia")
const loading = document.getElementById("loading")

let vozes = []
let falando = false
let somAtivo = true
let versiculoAtual = ""
let referenciaAtual = ""
let utteranceAtual = null

// Garantir que referência começa oculta
referenciaDiv.classList.remove('visivel')

// Mostrar loading por 3 segundos na primeira abertura
loading.classList.add('ativo')
setTimeout(() => {
    loading.classList.remove('ativo')
}, 3000)

// carregar vozes corretamente no celular
function carregarVozes() {
    vozes = speechSynthesis.getVoices()
}

carregarVozes()
speechSynthesis.onvoiceschanged = carregarVozes

botao.addEventListener("click", gerarVersiculo)
botaoSom.addEventListener("click", toggleSom)

// Função para alternar som
function toggleSom() {
    somAtivo = !somAtivo
    
    if (!somAtivo && falando) {
        speechSynthesis.cancel()
        falando = false
        removerDestaques()
        botao.disabled = false
    }
    
    if (somAtivo && versiculoAtual && !falando) {
        falarVersiculo(versiculoAtual)
    }
    
    // Atualizar ícone do botão
    const icon = botaoSom.querySelector('i')
    if (somAtivo) {
        icon.className = 'fas fa-volume-up'
    } else {
        icon.className = 'fas fa-volume-mute'
    }
}

// Função para remover todos os destaques
function removerDestaques() {
    document.querySelectorAll(".ativa").forEach(el => {
        el.classList.remove("ativa")
    })
}

async function gerarVersiculo() {
    if (falando) {
        speechSynthesis.cancel()
        falando = false
        removerDestaques()
    }

    botao.disabled = true

    try {
        const resposta = await fetch("https://bible-api.com/?random=verse&translation=almeida")
        const dados = await resposta.json()

        referenciaAtual = dados.reference
        referenciaDiv.innerText = referenciaAtual
        referenciaDiv.classList.add('visivel')

        versiculoAtual = dados.text
        mostrarVersiculo(dados.text)
        
        if (somAtivo) {
            falarVersiculo(dados.text)
        } else {
            destacarPalavrasSequencial(dados.text.split(" ").length)
            botao.disabled = false
        }

    } catch (err) {
        versiculoDiv.innerText = "Erro ao carregar versículo."
        botao.disabled = false
    }
}

function mostrarVersiculo(texto) {
    versiculoDiv.innerHTML = ""

    const palavras = texto.split(" ")

    palavras.forEach((p, i) => {
        const span = document.createElement("span")
        span.textContent = p + " "
        span.classList.add("palavra")
        span.id = "p" + i
        versiculoDiv.appendChild(span)
    })
}

function destacarPalavrasSequencial(totalPalavras) {
    let indice = 0
    
    if (window.intervaloDestaque) {
        clearInterval(window.intervaloDestaque)
    }
    
    window.intervaloDestaque = setInterval(() => {
        const atual = document.getElementById("p" + indice)
        
        if (atual) {
            removerDestaques()
            atual.classList.add("ativa")
        }
        
        indice++
        
        if (indice >= totalPalavras) {
            clearInterval(window.intervaloDestaque)
            window.intervaloDestaque = null
        }
    }, 450)
}

function falarVersiculo(texto) {
    if (falando) {
        speechSynthesis.cancel()
    }

    falando = true
    utteranceAtual = new SpeechSynthesisUtterance(texto)
    utteranceAtual.lang = "pt-BR"
    utteranceAtual.rate = 0.9
    utteranceAtual.pitch = 1

    const vozPt = vozes.find(v => v.lang.includes("pt"))
    if (vozPt) {
        utteranceAtual.voice = vozPt
    }

    const palavras = texto.split(" ")
    let indice = 0

    utteranceAtual.onboundary = function(event) {
        if (event.name === "word") {
            const palavraAtual = document.getElementById("p" + indice)

            if (palavraAtual) {
                removerDestaques()
                palavraAtual.classList.add("ativa")
            }

            indice++
        }
    }

    utteranceAtual.onend = function() {
        falando = false
        utteranceAtual = null
        botao.disabled = false
        removerDestaques()
    }

    utteranceAtual.onerror = function() {
        falando = false
        utteranceAtual = null
        botao.disabled = false
        removerDestaques()
    }

    speechSynthesis.cancel()

    setTimeout(() => {
        try {
            speechSynthesis.speak(utteranceAtual)
        } catch (e) {
            console.error("Erro ao falar:", e)
            falando = false
            utteranceAtual = null
            botao.disabled = false
        }
    }, 100)
}

speechSynthesis.addEventListener('voiceschanged', function() {
    vozes = speechSynthesis.getVoices()
})