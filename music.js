import { minhasMusicas } from './playlist.js';

// --- ESTADO DO PLAYER (Padronizado em uma única variável) ---
let musicaIndex = 0;

// --- SELETORES DE ELEMENTOS ---
const volumeSlider = document.getElementById('volume-slider');
const volumeIcon = document.getElementById('volume-icon');
const musicList = document.getElementById('music-list');
const playlistDiv = document.querySelector('.playlist');
const menuBtn = document.getElementById('menu-btn');
const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('playPause-btn');
const playIcon = document.getElementById('play-icon'); 
const coverImg = document.getElementById('cover-img');
const progressBar = document.getElementById('progress-bar');
const currentTimeLabel = document.getElementById('current-time');
const durationTimeLabel = document.getElementById('duration-time');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const playerContainer = document.getElementById('player-container');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const sleepTimerSelect = document.getElementById('sleep-timer');
const timerDisplay = document.getElementById('timer-display');
const stopAtEndCheck = document.getElementById('stop-at-end');
let timerContagem;

// --- INICIALIZAÇÃO DA LISTA ---
function carregarListaVisual() {
    musicList.innerHTML = ''; 
    minhasMusicas.forEach((musica, index) => {
        const li = document.createElement('li');
        li.textContent = musica.titulo;
        li.addEventListener('click', () => {
            musicaIndex = index; // Corrigido para usar a variável certa
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
    const musica = minhasMusicas[musicaIndex];
    
    if (!musica) return;

    // Atualiza o áudio e a capa
    audioPlayer.src = musica.url;
    if (coverImg) coverImg.src = musica.capa;

    // Atualiza os textos
    const txtTitulo = document.getElementById('titulo-musica');
    const txtArtista = document.getElementById('artista-musica');

    if (txtTitulo) txtTitulo.innerText = musica.titulo;
    if (txtArtista) txtArtista.innerText = musica.artista || "Artista Desconhecido";

    // Garante o play e atualiza o ícone para pause
    audioPlayer.play()
        .then(() => atualizarVisualBotao())
        .catch(err => console.log("Aguardando interação do usuário para reproduzir..."));
}

// Evento de clique no botão Play/Pause
playPauseBtn.addEventListener('click', () => {
    if (!audioPlayer.src || audioPlayer.src.includes('#') || audioPlayer.src === window.location.href) {
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
    musicaIndex = (musicaIndex + 1) % minhasMusicas.length;
    tocarMusicaAtual();
});

// Botão Anterior
prevBtn.addEventListener('click', () => {
    musicaIndex--;
    if (musicaIndex < 0) {
        musicaIndex = minhasMusicas.length - 1;
    }
    tocarMusicaAtual();
});

// Tocar próxima automaticamente ao acabar (Mesclado e Corrigido)
audioPlayer.addEventListener('ended', () => {
    if (stopAtEndCheck && stopAtEndCheck.checked) {
        audioPlayer.pause();
        atualizarVisualBotao(); 
        console.log("Reprodução interrompida: Opção 'Parar após esta faixa' está ativa.");
    } else {
        console.log("Música encerrada. Passando para a próxima...");
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

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        playerContainer.classList.remove('fullscreen');
        fullscreenBtn.textContent = '⛶ Tela Cheia';
    }
});

// --- SLEEP TIMER ---
sleepTimerSelect.addEventListener('change', () => {
    const minutos = parseInt(sleepTimerSelect.value);
    
    clearInterval(timerContagem);
    timerDisplay.textContent = "";

    if (minutos > 0) {
        let tempoRestante = minutos * 60; 

        timerContagem = setInterval(() => {
            tempoRestante--;

            const m = Math.floor(tempoRestante / 60);
            const s = tempoRestante % 60;
            timerDisplay.textContent = `Desligando em ${m}:${s < 10 ? '0' + s : s}`;

            if (tempoRestante <= 0) {
                clearInterval(timerContagem);
                audioPlayer.pause(); 
                atualizarVisualBotao(); 
                timerDisplay.textContent = "Timer encerrado.";
                sleepTimerSelect.value = "0"; 
            }
        }, 1000);
    }
});

// --- CONTROLE DE VOLUME ---
volumeSlider.addEventListener('input', (e) => {
    const valorVolume = e.target.value;
    audioPlayer.volume = valorVolume; 

    if (valorVolume == 0) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else if (valorVolume < 0.5) {
        volumeIcon.className = 'fas fa-volume-down';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
    }
});

let volumeAnterior = 1;
volumeIcon.addEventListener('click', () => {
    if (audioPlayer.volume > 0) {
        volumeAnterior = audioPlayer.volume; 
        audioPlayer.volume = 0;
        volumeSlider.value = 0;
        volumeIcon.className = 'fas fa-volume-mute';
    } else {
        audioPlayer.volume = volumeAnterior; 
        volumeSlider.value = volumeAnterior;
        volumeIcon.className = volumeAnterior < 0.5 ? 'fas fa-volume-down' : 'fas fa-volume-up';
    }
});

// Atalhos do teclado
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'm') {
        volumeIcon.click(); 
    }
});

// Inicialização
carregarListaVisual();