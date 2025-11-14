$(document).ready(() => {
    // ===== CHAVES DA API (MANTENHA, MAS USE BACKEND EM PRODUÇÃO) =====
    const API_KEYS = [
        // Suas chaves de API...
        'AIzaSyAXQ8pDhmoWtmD3vP_SVy3PAtB5mcyLrik',
        'AIzaSyAELl7fzEAwusdazxOg6eg3PxQiJe44ic8',
        'AIzaSyBrRvpEiOPZK4mSKoPsx1uCAkWBd9vuHdg',
        'AIzaSyCQuah_L2fywMqqqLNC1CQuFN_VVRbDoM',
        'AIzaSyBfZLVv_fEMppsuOZmi_2hMvgKyNMRv6_A',
        'AIzaSyBudXNiZ5V9P_jeteNx47AUndcvLLrRLvw',
        'AIzaSyDKJnsHr3C37LCbxJIFzK6IcLBWdODm6j8',
        'AIzaSyAxMkuH9b7jQLrKP2bM57JXUxUOOkzrusU',
        'AIzaSyDQMkx6W7zIuys1QeeAMbkOf_HFbfo9jiU',
        'AIzaSyAy9-AEdW5wA0Bs_PLCp_YF1I5EYed1YYId'
    ];

    function getRandomKey() {
        const index = Math.floor(Math.random() * API_KEYS.length);
        const key = API_KEYS[index];
        console.log("Chave usada:", key);
        return key;
    }

    // ===== DETECTA MOBILE =====
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // ===== FUNÇÃO PARA ABRIR VÍDEO (COM FULLSCREEN + LANDSCAPE) =====
    function abrirVideo(videoId) {
        const iframe = document.getElementById("wath");
        const modal = document.getElementById("model_play");

        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=0&mute=0&rel=0`;
        modal.style.display = "flex";

        if (isMobile()) {
            setTimeout(() => {
                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock('landscape').catch(() => {
                        console.log("Lock de orientação não suportado (iOS ou navegador antigo)");
                    });
                }
                if (iframe.requestFullscreen) {
                    iframe.requestFullscreen();
                } else if (iframe.webkitRequestFullscreen) {
                    iframe.webkitRequestFullscreen();
                } else if (iframe.msRequestFullscreen) {
                    iframe.msRequestFullscreen();
                }
            }, 600);
        }
    }

    // ===== BUSCA NO YOUTUBE (BUSCA 50, EXIBE 16) =====
    function buscar() {
        let query = document.getElementById("search").value.trim();
        if (!query) return;

        const key = getRandomKey();
        
        // **ALTERAÇÃO 1: maxResults=50 para máxima eficiência de cota (Custo: 100)**
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=50&order=relevance&regionCode=BR&key=${key}`;

        $("#box_video").html('<div class="loading">Carregando...</div>');
        $("#confirma_busca").html('<h2>Buscando vídeos...</h2>');

        fetch(url)
            .then(r => r.json())
            .then(data => {
                let container = document.getElementById("box_video");
                container.innerHTML = "";
                
                if (!data.items || data.items.length === 0) {
                    container.innerHTML = "<p>Nenhum vídeo encontrado.</p>";
                    $("#confirma_busca").html("<h2>Sem resultados</h2>");
                    return;
                }

                // **ALTERAÇÃO 2: Limita a exibição inicial a 16 vídeos**
                const videosExibirInicial = 16;
                const itemsParaExibir = data.items.slice(0, videosExibirInicial);
                
                itemsParaExibir.forEach(item => {
                    let videoId = item.id.videoId;
                    let thumb = item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium.url;
                    let title = item.snippet.title.replace(/</g, "&lt;").replace(/>/g, "&gt;");

                    let div = document.createElement("div");
                    div.className = "video-item";
                    div.tabIndex = 0;
                    div.innerHTML = `
                        <img src="${thumb}" alt="${title}" loading="lazy">
                        <p>${title}</p>
                    `;

                    div.onclick = () => abrirVideo(videoId);
                    div.onkeydown = (e) => { if (e.key === "Enter") abrirVideo(videoId); };

                    container.appendChild(div);
                });

                let msgConfirmacao = `<h2>${itemsParaExibir.length} vídeos exibidos de ${data.items.length} encontrados</h2>`;
                
                // **Opcional: Adiciona um aviso se há mais para carregar**
                if (data.items.length > videosExibirInicial) {
                    msgConfirmacao += `<p>Há mais ${data.items.length - videosExibirInicial} vídeos disponíveis. Adicione o botão "Carregar Mais"!</p>`;
                }
                
                $("#confirma_busca").html(msgConfirmacao);

                // **Melhoria: Armazena o restante dos dados para "Carregar Mais" sem nova API Call**
                // Em um projeto real, você armazenaria 'data.items' em uma variável global
                // ou do componente para usar no botão "Carregar Mais".
            })
            .catch(err => {
                console.error("Erro:", err);
                $("#box_video").html("<p>Erro na busca. Tente novamente.</p>");
                $("#confirma_busca").html("<h2>Erro</h2>");
            });
    }

    // ===== FECHAR MODAL =====
    function fecharModal() {
        $("#wath").attr("src", "");
        $("#model_play").css("display", "none");

        if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
        }

        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }

    // ===== EVENTOS =====
    $("#btn").click(() => {
        buscar();
        $("#search").val("");
    });

    $("#search").on("keydown", e => {
        if (e.key === "Enter") {
            buscar();
            $("#search").val("");
        }
    });

    $("#close").on("click", fecharModal);

    $(document).on("keydown", e => {
        if (e.key === "Escape") fecharModal();
    });

    $("#model_play").on("click", e => {
        if (e.target.id === "model_play") fecharModal();
    });

    $("#confirma_busca").html(`<h2>Pesquise algo no YouTube</h2>`);
});
