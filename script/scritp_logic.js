$(document).ready(() => {
    // Variáveis para controlar os vídeos e o estado de exibição
    let allVideos = []; // Armazena os 50 vídeos da API
    let currentDisplayIndex = 0; // Índice do próximo vídeo a ser exibido
    const BATCH_SIZE = 16; // Quantidade de vídeos a carregar por vez

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

    // ===== DETECTA MOBILE (Restante do código...) =====
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // ===== FUNÇÃO PARA ABRIR VÍDEO (Restante do código...) =====
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
    
    // ===== FUNÇÃO AJUDAR PARA CRIAR O ITEM DE VÍDEO (REUSÁVEL) =====
    function createVideoItem(item) {
        let videoId = item.id.videoId;
        let thumb = item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium.url;
        let title = item.snippet.title.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // XSS safe

        let div = document.createElement("div");
        div.className = "video-item";
        div.tabIndex = 0;
        div.innerHTML = `
            <img src="${thumb}" alt="${title}" loading="lazy">
            <p>${title}</p>
        `;

        div.onclick = () => abrirVideo(videoId);
        div.onkeydown = (e) => { if (e.key === "Enter") abrirVideo(videoId); };
        
        return div;
    }

    // ===== FUNÇÃO PARA EXIBIR O PRÓXIMO LOTE DE VÍDEOS =====
    function displayNextBatch() {
        const container = document.getElementById("box_video");
        const startIndex = currentDisplayIndex;
        const endIndex = Math.min(allVideos.length, currentDisplayIndex + BATCH_SIZE);
        
        // Renderiza apenas o novo lote
        for (let i = startIndex; i < endIndex; i++) {
            const videoItem = createVideoItem(allVideos[i]);
            container.appendChild(videoItem);
        }

        // Atualiza o índice
        currentDisplayIndex = endIndex;
        
        // Atualiza o botão "Carregar Mais"
        updateLoadMoreButton();
    }
    
    // ===== FUNÇÃO PARA CRIAR/ATUALIZAR O BOTÃO "CARREGAR MAIS" =====
    function updateLoadMoreButton() {
        const btnContainer = document.getElementById("load-more-container");
        
        // Verifica se ainda há vídeos para exibir
        if (currentDisplayIndex < allVideos.length) {
            
            // Se o botão não existe, cria ele
            if (!document.getElementById("btn-carregar-mais")) {
                let btn = document.createElement("button");
                btn.id = "btn-carregar-mais";
                btn.textContent = `Carregar Mais`;
                btn.onclick = displayNextBatch; // Liga a função ao clique
                btnContainer.innerHTML = ''; // Limpa antes de adicionar
                btnContainer.appendChild(btn);
            }
            
            // Atualiza o texto para refletir quantos faltam
            const restantes = allVideos.length - currentDisplayIndex;
            const proximoLote = Math.min(BATCH_SIZE, restantes);
            
            $("#btn-carregar-mais").text(`Carregar Mais (${proximoLote} de ${restantes})`);
            
        } else {
            // Se todos os vídeos foram exibidos, remove o botão
            btnContainer.innerHTML = '<p class="end-message">Fim dos resultados.</p>';
        }

        // Atualiza a mensagem de confirmação
        $("#confirma_busca").html(`<h2>${currentDisplayIndex} vídeos exibidos de ${allVideos.length} encontrados</h2>`);
    }

    // ===== BUSCA NO YOUTUBE (BUSCA 50) =====
    function buscar() {
        let query = document.getElementById("search").value.trim();
        if (!query) return;

        const key = getRandomKey();
        
        // Busca com maxResults=50 (Custo: 100 créditos)
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=50&order=relevance&regionCode=BR&key=${key}`;

        $("#box_video").html('<div class="loading">Carregando...</div>');
        // Limpa o container do botão durante o carregamento
        $("#load-more-container").html(''); 
        $("#confirma_busca").html('<h2>Buscando vídeos...</h2>');

        fetch(url)
            .then(r => r.json())
            .then(data => {
                
                // 1. Inicializa o estado com os novos dados
                allVideos = data.items || [];
                currentDisplayIndex = 0;
                
                if (allVideos.length === 0) {
                    $("#box_video").html("<p>Nenhum vídeo encontrado.</p>");
                    $("#confirma_busca").html("<h2>Sem resultados</h2>");
                    return;
                }

                // 2. Limpa o container para a primeira exibição
                $("#box_video").html('');
                
                // 3. Exibe o primeiro lote de vídeos
                displayNextBatch();

            })
            .catch(err => {
                console.error("Erro:", err);
                $("#box_video").html("<p>Erro na busca. Tente novamente.</p>");
                $("#confirma_busca").html("<h2>Erro</h2>");
            });
    }

    // ===== FECHAR MODAL (Restante do código...) =====
    function fecharModal() {
        $("#wath").attr("src", "");
        $("#model_play").css("display", "none");

        // Desbloqueia orientação
        if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
        }

        // Sai do fullscreen
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }

    // ===== EVENTOS (Restante do código...) =====
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

    // Fechar com ESC
    $(document).on("keydown", e => {
        if (e.key === "Escape") fecharModal();
    });

    // Fechar clicando fora
    $("#model_play").on("click", e => {
        if (e.target.id === "model_play") fecharModal();
    });

    // Inicial
    $("#confirma_busca").html(`<h2>Pesquise algo no YouTube</h2>`);
});
