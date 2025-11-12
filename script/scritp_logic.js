$(document).ready(() => {
    // ===== 10 CHAVES (CRIE 10 PROJETOS NO GOOGLE CLOUD) =====
    const API_KEYS = [
        'AIzaSyAXQ8pDhmoWtmD3vP_SVy3PAtB5mcyLrik',
        'AIzaSyAELl7fzEAwusdazxOg6eg3PxQiJe44ic8',
        'AIzaSyBrRvpEiOPZK4mSKoPsx1uCAkWBd9vuHdg',
        'AIzaSyCQuahC_L2fywMqqqLNC1CQuFN_VVRbDoM',
        'AIzaSyBfZLVv_fEMppsuOZmi_2hMvgKyNMRv6_A',
        'AIzaSyBudXNiZ5V9P_jeteNx47AUndcvLLrRLvw',
        'AIzaSyDKJnsHr3C37LCbxJIFzK6IcLBWdODm6j8',
        'AIzaSyAxMkuH9b7jQLrKP2bM57JXUxUOOkzrusU',
        'AIzaSyDQMkx6W7zIuys1QeeAMbkOf_HFbfo9jiU',
        'AIzaSyAy9-AEdW5wA0Bs_PLCp_YF1I5EYed1YYId'

       
    ];

    // CHAVE ALEATÓRIA A CADA BUSCA (NUNCA REPETE PADRÃO)
    function getRandomKey() {
        const index = Math.floor(Math.random() * API_KEYS.length);
        const key = API_KEYS[index];
        console.log("Chave usada:", key); // ← REMOVE DEPOIS DE TESTAR
        return key;
    }

    function e() { 
        $("#fb").attr("href", "https://www.facebook.com/profile.php?id=100074620631348");
        $("#ins").attr("href", "https://www.instagram.com/jorge_devs/");
        $("#lins").attr("href", "https://www.linkedin.com/in/jorge-devs");
    }

    function t() { 
        $("#close").on("click", () => { 
            $("#wath").attr("src", ""); 
            $("#model_play").css("display", "none");
        });
    }

    function o() {
        let query = document.getElementById("search").value.trim();
        if (!query) return;

        const key = getRandomKey(); // ← ALEATÓRIA A CADA BUSCA
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&order=relevance&regionCode=BR&key=${key}`;

        fetch(url)
            .then(r => r.json())
            .then(data => {
                let t = document.getElementById("box_video");
                t.innerHTML = "";
                data.items.forEach(item => {
                    let videoId = item.id.videoId;
                    let thumb = item.snippet.thumbnails.high.url;
                    let title = item.snippet.title;

                    let s = document.createElement("div");
                    s.onclick = () => n(videoId);
                    s.innerHTML = `
                        <img src="${thumb}" alt="Imagem">
                        <legend>${title}</legend>
                    `;
                    t.appendChild(s);
                });
                $("#confirma_busca").html(`<h2>Resultado (${data.items.length} vídeos)</h2>`);
            })
            .catch(err => {
                console.error("Erro com chave:", key, err);
                $("#confirma_busca").html(`<h2>Erro. Tente novamente.</h2>`);
            });
    }

    function n(videoId) { 
        $("#model_play").css("display", "block");
        $("#wath").attr("src", `https://www.youtube.com/embed/${videoId}`);
    }

    $("#btn").click(o);
    $("#search").on("keydown", e => {
        if (e.key === "Enter") {
            o();
            $("#search").val("");
        }
    });

    e(); t();
    $("#confirma_busca").html(`<h2>Pesquise algo</h2>`);
});
