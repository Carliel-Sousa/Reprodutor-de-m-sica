import { minhasMusicas } from './playlist.js';

// --- SELETORES DE ELEMENTOS ---
const musicList = document.getElementById('music-list');
const playlistDiv = document.querySelector('.playlist');
const menuBtn = document.getElementById('menu-btn');
const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('playPause-btn');
const playIcon = document.getElementById('play-icon'); // Ícone do FontAwesome
const coverImg = document.getElementById('cover-img');
const dynamicBg = document.getElementById('dynamic-bg');
const progressBar = document.getElementById('progress-bar');
const currentTimeLabel = document.getElementById('current-time');
const durationTimeLabel = document.getElementById('duration-time');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const playerContainer = document.getElementById('player-container');
const fullscreenBtn = document.getElementById('fullscreen-btn');

// --- ESTADO DO PLAYER ---
let indiceAtual = 0;

// --- INICIALIZAÇÃO DA LISTA ---
function carregarListaVisual() {
    musicList.innerHTML = ''; 
    minhasMusicas.forEach((musica, index) => {
        const li = document.createElement('li');
        li.textContent = musica.titulo;
        li.addEventListener('click', () => {
            indiceAtual = index;
            tocarMusicaAtual();
            playlistDiv.classList.remove('open');
        });
        musicList.appendChild(li);
    });
}

// --- FUNÇÕES DE CONTROLE ---

function atualizarVisualBotao() {
    if (audioPlayer.paused) {
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
        playIcon.style.paddingLeft = "4px"; 
    } else {
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
        playIcon.style.paddingLeft = "0px";
    }
}

function tocarMusicaAtual() {
    const musica = minhasMusicas[indiceAtual];
    if (musica) {
        audioPlayer.src = musica.url;
        coverImg.src = musica.capa;
        
        // Atualiza o fundo dinâmico se ele existir
        if (dynamicBg) {
            dynamicBg.style.backgroundImage = `url(${musica.capa})`;
        }

        audioPlayer.play()
            .then(() => atualizarVisualBotao())
            .catch(err => console.log("Erro ao reproduzir:", err));
    }
}

// Evento de clique no botão Play/Pause
playPauseBtn.addEventListener('click', () => {
    if (!audioPlayer.src || audioPlayer.src.includes('#')) {
        tocarMusicaAtual();
    } else {
        if (audioPlayer.paused) {
            audioPlayer.play();
        } else {
            audioPlayer.pause();
        }
        atualizarVisualBotao();
    }
});

// Botão Próximo
nextBtn.addEventListener('click', () => {
    indiceAtual = (indiceAtual + 1) % minhasMusicas.length;
    tocarMusicaAtual();
});

// Botão Anterior
prevBtn.addEventListener('click', () => {
    indiceAtual = (indiceAtual - 1 + minhasMusicas.length) % minhasMusicas.length;
    tocarMusicaAtual();
});

// Tocar próxima automaticamente ao acabar
audioPlayer.addEventListener('ended', () => {
    // Verifica se a opção "Parar após esta música" está marcada
    if (stopAtEndCheck.checked) {
        audioPlayer.pause();
        atualizarVisualBotao(); // Volta o ícone para o desenho de "Play"
        console.log("Reprodução interrompida pelo usuário ao final da faixa.");
    } else {
        // Se NÃO estiver marcada, toca a próxima normalmente
        nextBtn.click();
    }
});

// Menu Toggle (Playlist lateral)
menuBtn.addEventListener('click', () => {
    playlistDiv.classList.toggle('open');
});

// Fecha o menu ao clicar fora dele
document.addEventListener('click', (event) => {
    const isClickInsideMenu = playlistDiv.contains(event.target);
    const isClickOnButton = menuBtn.contains(event.target);

    // Se o menu estiver aberto E o clique não foi nele nem no botão de abrir...
    if (playlistDiv.classList.contains('open') && !isClickInsideMenu && !isClickOnButton) {
        playlistDiv.classList.remove('open');
    }
});

// --- PROGRESSO E TEMPO ---

audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.value = progress;

        const formatTime = (time) => {
            const min = Math.floor(time / 60);
            const sec = Math.floor(time % 60);
            return `${min}:${sec < 10 ? '0' + sec : sec}`;
        };

        currentTimeLabel.textContent = formatTime(audioPlayer.currentTime);
        durationTimeLabel.textContent = formatTime(audioPlayer.duration);
    }
});

// Pular tempo ao clicar na barra
progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audioPlayer.currentTime = pos * audioPlayer.duration;
});

// --- TELA CHEIA ---

fullscreenBtn.addEventListener('click', () => {
    playerContainer.classList.toggle('fullscreen');
    
    if (!document.fullscreenElement) {
        playerContainer.requestFullscreen().catch(err => {
            console.warn(`Erro ao ativar tela cheia: ${err.message}`);
        });
        fullscreenBtn.textContent = '✖ Sair';
    } else {
        document.exitFullscreen();
        fullscreenBtn.textContent = '⛶ Tela Cheia';
    }
});

// Garante que o texto do botão mude se o usuário apertar ESC
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        playerContainer.classList.remove('fullscreen');
        fullscreenBtn.textContent = '⛶ Tela Cheia';
    }
});

// Inicialização
carregarListaVisual();

const sleepTimerSelect = document.getElementById('sleep-timer');
const timerDisplay = document.getElementById('timer-display');
let timerContagem;

sleepTimerSelect.addEventListener('change', () => {
    const minutos = parseInt(sleepTimerSelect.value);
    
    // Limpa qualquer timer que já esteja rodando
    clearInterval(timerContagem);
    timerDisplay.textContent = "";

    if (minutos > 0) {
        let tempoRestante = minutos * 60; // converte para segundos

        timerContagem = setInterval(() => {
            tempoRestante--;

            // Atualiza o texto para o usuário ver quanto tempo falta
            const m = Math.floor(tempoRestante / 60);
            const s = tempoRestante % 60;
            timerDisplay.textContent = `Desligando em ${m}:${s < 10 ? '0' + s : s}`;

            if (tempoRestante <= 0) {
                clearInterval(timerContagem);
                audioPlayer.pause(); // Pausa a música
                atualizarVisualBotao(); // Atualiza o ícone para "Play"
                timerDisplay.textContent = "Timer encerrado.";
                sleepTimerSelect.value = "0"; // Reseta o seletor
            }
        }, 1000);
    }
});

// EVENTO: Quando a música atual terminar
audioPlayer.addEventListener('ended', () => {
    // 1. Verifica se a função "Parar após esta música" está DESATIVADA
    const stopAtEndCheck = document.getElementById('stop-at-end');
    
    if (stopAtEndCheck && stopAtEndCheck.checked) {
        // Se o usuário marcou para parar, apenas resetamos o visual
        atualizarVisualBotao();
        console.log("Parado: Opção 'Parar após esta faixa' está ativa.");
    } else {
        // Se estiver no modo normal, pula para a próxima
        console.log("Música encerrada. Passando para a próxima...");
        nextBtn.click(); // Chama o evento do botão Próximo que já criamos
    }
});