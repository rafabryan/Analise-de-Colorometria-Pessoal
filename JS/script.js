const schema = {
            type: "array",
            items: {
                type: "string",
                pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
            }
        };

        let foto = document.querySelector("#foto");
        let processa = document.querySelector("#processa");
        let container = document.querySelector("#container");

        processa.onclick = async () => {
            if (!foto.files[0]) {
                alert("Por favor, selecione uma imagem primeiro.");
                return;
            }

            let userFoto = foto.files[0];
            
            try {
                // Modifica o texto do botão para indicar carregamento
                processa.innerText = "Processando...";
                processa.disabled = true;

                const session = await LanguageModel.create({
                    expectedInputs: [
                        { type: "text", languages: ["en"] },
                        { type: "image" },
                    ],
                    expectedOutputs: [{ type: "text", languages: ["en"] }],
                });
                
                console.log('inicia');
                
                const response = await session.prompt([
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                value: "Realize a colorimetria desta pessoa da imagem e retorne as cores que vão destacar os seus traços",
                            },
                            { type: "image", value: userFoto },
                        ],
                    },
                ], {  
                    responseConstraint: schema,
                });
                
                let arrDeCores = JSON.parse(response);

                // --- CRIAÇÃO DO CARD ---
                
                // 1. Cria o elemento Card principal
                let card = document.createElement('div');
                card.className = 'card';

                // 2. Cria e configura a tag de imagem usando URL.createObjectURL para ler o File
                let imgElement = document.createElement('img');
                imgElement.src = URL.createObjectURL(userFoto);
                card.appendChild(imgElement);

                // 3. Cria o container que vai segurar as cores
                let divCores = document.createElement('div');
                divCores.className = 'cores-container';

                // 4. Cria os círculos de cores baseados no Array retornado pela IA
                arrDeCores.forEach(cor => {
                    let circulo = document.createElement('div');
                    circulo.className = 'circulo-cor';
                    circulo.style.backgroundColor = cor; // Aplica o HEX recebido
                    circulo.title = cor; // Mostra o HEX ao passar o mouse por cima
                    divCores.appendChild(circulo);
                });

                // 5. Adiciona as cores ao card, e o card ao container flex da página
                card.appendChild(divCores);
                container.appendChild(card);

            } catch (error) {
                console.error("Erro ao processar imagem:", error);
                alert("Ocorreu um erro ao processar a imagem. Verifique o console.");
            } finally {
                // Restaura o botão
                processa.innerText = "Processar Imagem";
                processa.disabled = false;
            }
        };

        async function startApp() {
            // Verifica se a API experimental 'LanguageModel' está disponível no ambiente do usuário
            if (typeof LanguageModel === 'undefined') {
                console.error("A API 'LanguageModel' não é suportada neste navegador.");
                processa.disabled = true;
                processa.innerText = "API Indisponível";
                alert("Seu navegador não suporta a API LanguageModel utilizada neste código.");
            } else {
                console.log("LanguageModel API pronta. Aguardando input do usuário.");
            }
        }
        
        startApp();