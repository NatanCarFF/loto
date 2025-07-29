document.addEventListener('DOMContentLoaded', () => {
    const sortearBtn = document.getElementById('sortearBtn');
    const copiarBtn = document.getElementById('copiarBtn');
    const resultadoDiv = document.getElementById('resultado');
    const historicoDiv = document.getElementById('historico');
    const limparHistoricoBtn = document.getElementById('limparHistoricoBtn');
    const noHistoryMessage = document.getElementById('no-history-message');

    // Elementos do balão de mensagens (feedback)
    const messageBubble = document.getElementById('messageBubble');
    const messageText = document.getElementById('messageText');
    const closeMessageBtn = document.getElementById('closeMessage');

    // Elementos do balão de confirmação (Sim/Não)
    const confirmationBubble = document.getElementById('confirmationBubble');
    const confirmationText = document.getElementById('confirmationText');
    const confirmYesBtn = document.getElementById('confirmYes');
    const confirmNoBtn = document.getElementById('confirmNo');

    // Elementos do painel de temas
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themePanel = document.getElementById('themePanel');
    const themeOptionsDiv = document.getElementById('themeOptions');
    const closeThemePanelBtn = document.getElementById('closeThemePanel');

    const TOTAL_NUMEROS = 50;
    const LIMITE_NUMERO = 99;
    const LOCAL_STORAGE_KEY_HISTORICO = 'sorteiosHistorico';
    const LOCAL_STORAGE_KEY_TEMA = 'currentTheme';

    let numerosSorteadosAtuais = [];
    let resolveConfirmationPromise; // Para gerenciar a promessa do balão de confirmação

    // --- Definição dos Temas ---
    const themes = [
        { name: 'Claro Padrão', class: '', primary: '#007bff', background: '#f8f9fa' },
        { name: 'Escuro', class: 'dark-theme', primary: '#8aa6ed', background: '#1e1e1e' },
        { name: 'Verde', class: 'green-theme', primary: '#28a745', background: '#e6ffe6' },
        { name: 'Roxo', class: 'purple-theme', primary: '#6f42c1', background: '#f5f0ff' },
        { name: 'Laranja', class: 'orange-theme', primary: '#fd7e14', background: '#fff8f0' },
        { name: 'Cinza', class: 'grey-theme', primary: '#6c757d', background: '#eff2f5' },
        { name: 'Ciano', class: 'cyan-theme', primary: '#17a2b8', background: '#e0faff' },
        { name: 'Rosa', class: 'pink-theme', primary: '#e83e8c', background: '#fff0f5' },
        { name: 'Índigo', class: 'indigo-theme', primary: '#6610f2', background: '#3f007d' },
        { name: 'Marrom', class: 'brown-theme', primary: '#795548', background: '#f3e5e1' },
        // Novos temas
        { name: 'Azul Claro', class: 'light-blue-theme', primary: '#5bc0de', background: '#e0f7fa' },
        { name: 'Vermelho Escuro', class: 'dark-red-theme', primary: '#a00000', background: '#300000' }
    ];

    let currentThemeClass = ''; // Armazena a classe CSS do tema atual

    // --- Funções do Balão de Mensagens (feedback geral) ---
    function showMessage(message, type = 'info') { // type: 'success', 'error', 'info'
        messageText.textContent = message;
        messageBubble.className = 'message-bubble show ' + type; // Adiciona a classe de tipo
        messageBubble.style.display = 'flex'; // Garante que esteja visível

        // Fecha a mensagem automaticamente após 5 segundos
        setTimeout(() => {
            hideMessage();
        }, 5000);
    }

    function hideMessage() {
        messageBubble.classList.remove('show');
        // Pequeno atraso para a transição terminar antes de display: none
        setTimeout(() => {
            messageBubble.style.display = 'none';
        }, 300);
    }

    closeMessageBtn.addEventListener('click', hideMessage);

    // --- Funções do Balão de Confirmação (Sim/Não) ---
    function showConfirmation(message) {
        return new Promise(resolve => {
            confirmationText.textContent = message;
            confirmationBubble.classList.add('show');
            confirmationBubble.style.display = 'flex'; // Garante que esteja visível

            resolveConfirmationPromise = resolve; // Salva a função resolve para uso posterior
        });
    }

    function hideConfirmation(result) {
        confirmationBubble.classList.remove('show');
        // Pequeno atraso para a transição terminar
        setTimeout(() => {
            confirmationBubble.style.display = 'none';
            if (resolveConfirmationPromise) {
                resolveConfirmationPromise(result); // Resolve a promessa com o resultado
                resolveConfirmationPromise = null; // Limpa a referência
            }
        }, 300);
    }

    confirmYesBtn.addEventListener('click', () => hideConfirmation(true));
    confirmNoBtn.addEventListener('click', () => hideConfirmation(false));

    // --- Funções de Utilitário ---
    function padZero(num) {
        return num < 10 ? '0' + num : num;
    }

    function getFormattedDateTime() {
        const now = new Date();
        const day = padZero(now.getDate());
        const month = padZero(now.getMonth() + 1);
        const year = now.getFullYear();
        const hours = padZero(now.getHours());
        const minutes = padZero(now.getMinutes());
        const seconds = padZero(now.getSeconds());
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

    // --- Funções de Tema ---
    function applyTheme(themeClass) {
        // Remove a classe do tema anterior
        if (currentThemeClass) {
            document.body.classList.remove(currentThemeClass);
        }
        // Aplica a nova classe de tema
        if (themeClass) {
            document.body.classList.add(themeClass);
        }
        currentThemeClass = themeClass; // Atualiza o tema atual
        localStorage.setItem(LOCAL_STORAGE_KEY_TEMA, themeClass); // Salva no Local Storage
        
        // Atualiza a seleção visual no painel
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.themeClass === themeClass) {
                option.classList.add('selected');
            }
        });
    }

    function renderThemeOptions() {
        themeOptionsDiv.innerHTML = '';
        themes.forEach(theme => {
            const themeOption = document.createElement('div');
            themeOption.classList.add('theme-option');
            themeOption.dataset.themeClass = theme.class; // Armazena a classe no dataset

            const themePreview = document.createElement('div');
            themePreview.classList.add('theme-preview');
            themePreview.style.backgroundColor = theme.background;
            themePreview.style.borderColor = theme.primary; // Borda com cor primária do tema

            const themeName = document.createElement('p');
            themeName.textContent = theme.name;

            themeOption.appendChild(themePreview);
            themeOption.appendChild(themeName);

            themeOption.addEventListener('click', () => {
                applyTheme(theme.class);
            });

            themeOptionsDiv.appendChild(themeOption);
        });

        // Aplica a seleção visual inicial
        const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_TEMA) || '';
        document.querySelectorAll('.theme-option').forEach(option => {
            if (option.dataset.themeClass === savedTheme) {
                option.classList.add('selected');
            }
        });
    }

    // Abre e fecha o painel de temas
    themeToggleBtn.addEventListener('click', () => {
        themePanel.style.display = 'flex';
    });

    closeThemePanelBtn.addEventListener('click', () => {
        themePanel.style.display = 'none';
    });


    // --- Funções de Histórico ---
    function carregarHistorico() {
        const historicoRaw = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORICO);
        return historicoRaw ? JSON.parse(historicoRaw) : [];
    }

    function salvarHistorico(historico) {
        localStorage.setItem(LOCAL_STORAGE_KEY_HISTORICO, JSON.stringify(historico));
    }

    function renderizarHistorico() {
        const historico = carregarHistorico();
        historicoDiv.innerHTML = '';

        if (historico.length === 0) {
            noHistoryMessage.style.display = 'block';
            limparHistoricoBtn.style.display = 'none';
            historicoDiv.appendChild(noHistoryMessage);
            return;
        } else {
            noHistoryMessage.style.display = 'none';
            limparHistoricoBtn.style.display = 'inline-flex';
        }

        historico.forEach(item => {
            const historicoItemDiv = document.createElement('div');
            historicoItemDiv.classList.add('historico-item');

            const dataHoraSpan = document.createElement('span');
            dataHoraSpan.classList.add('data-hora');
            dataHoraSpan.textContent = item.timestamp;
            historicoItemDiv.appendChild(dataHoraSpan);

            const numerosHistoricoSpan = document.createElement('span');
            numerosHistoricoSpan.classList.add('numeros-historico');
            numerosHistoricoSpan.innerHTML = item.numbers.map(num => `<span class="num">${num}</span>`).join('');
            historicoItemDiv.appendChild(numerosHistoricoSpan);

            historicoDiv.prepend(historicoItemDiv);
        });
    }

    // Função para limpar histórico com confirmação
    async function handleLimparHistorico() {
        hideMessage(); // Esconde qualquer mensagem de feedback existente
        const confirmed = await showConfirmation('Tem certeza que deseja limpar todo o histórico de sorteios?');
        
        if (confirmed) {
            localStorage.removeItem(LOCAL_STORAGE_KEY_HISTORICO);
            renderizarHistorico();
            showMessage('Histórico de sorteios limpo com sucesso!', 'info');
        } else {
            showMessage('Operação de limpar histórico cancelada.', 'info');
        }
    }

    // --- Funções de Sorteio ---
    async function sortearNumeros() {
        hideMessage(); // Esconde qualquer mensagem existente
        hideConfirmation(false); // Garante que o balão de confirmação esteja escondido
        sortearBtn.disabled = true;
        copiarBtn.style.display = 'none';
        resultadoDiv.innerHTML = '';
        numerosSorteadosAtuais = [];

        const numerosDisponiveis = Array.from({ length: LIMITE_NUMERO + 1 }, (_, i) => i);
        
        if (TOTAL_NUMEROS > numerosDisponiveis.length) {
            showMessage(`Erro: Não é possível sortear ${TOTAL_NUMEROS} números únicos de ${LIMITE_NUMERO + 1} opções disponíveis.`, 'error');
            sortearBtn.disabled = false;
            return;
        }

        for (let i = numerosDisponiveis.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numerosDisponiveis[i], numerosDisponiveis[j]] = [numerosDisponiveis[j], numerosDisponiveis[i]];
        }

        const elementosTemporarios = [];
        for (let i = 0; i < TOTAL_NUMEROS; i++) {
            const numeroElemento = document.createElement('span');
            numeroElemento.classList.add('numero', 'sorteando');
            numeroElemento.textContent = Math.floor(Math.random() * (LIMITE_NUMERO + 1));
            resultadoDiv.appendChild(numeroElemento);
            elementosTemporarios.push(numeroElemento);
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        for (let i = 0; i < TOTAL_NUMEROS; i++) {
            const numeroFinal = numerosDisponiveis[i];
            const elemento = elementosTemporarios[i];

            elemento.classList.remove('sorteando');
            elemento.textContent = padZero(numeroFinal); // Usa padZero para formatar
            numerosSorteadosAtuais.push(numeroFinal);

            await new Promise(resolve => setTimeout(resolve, 70));
        }

        numerosSorteadosAtuais.sort((a, b) => a - b);
        resultadoDiv.innerHTML = numerosSorteadosAtuais.map(num => `<span class="numero">${padZero(num)}</span>`).join('');

        const historico = carregarHistorico();
        historico.push({
            timestamp: getFormattedDateTime(),
            numbers: numerosSorteadosAtuais.map(padZero) // Salva números formatados no histórico
        });
        salvarHistorico(historico);
        renderizarHistorico();
        showMessage('Números sorteados com sucesso!', 'success');

        copiarBtn.style.display = 'inline-flex';
        sortearBtn.disabled = false;
    }

    // Função para copiar resultado para a área de transferência
    function copiarResultado() {
        const textoResultado = numerosSorteadosAtuais.map(padZero).join(', '); // Copia números formatados
        navigator.clipboard.writeText(textoResultado)
            .then(() => {
                const originalText = copiarBtn.innerHTML;
                const originalBgColor = getComputedStyle(copiarBtn).backgroundColor;

                copiarBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                copiarBtn.style.backgroundColor = 'var(--copy-btn-feedback-bg)';

                setTimeout(() => {
                    copiarBtn.innerHTML = originalText;
                    // Ao invés de usar originalBgColor (que é um valor RGB),
                    // redefinimos para a variável CSS para que se adapte ao tema.
                    copiarBtn.style.backgroundColor = ''; // Remove a definição inline
                    copiarBtn.style.transition = 'none'; // Temporariamente remove a transição
                    copiarBtn.style.backgroundColor = 'var(--copy-btn-initial-bg)'; // Reaplica via variável
                    setTimeout(() => {
                        copiarBtn.style.transition = 'all 0.3s ease, background-color 0.3s ease'; // Restaura a transição
                    }, 50); // Pequeno atraso para garantir a aplicação

                }, 1500);
                showMessage('Resultado copiado para a área de transferência!', 'success');
            })
            .catch(err => {
                console.error('Erro ao copiar texto: ', err);
                showMessage('Falha ao copiar o resultado. Por favor, tente novamente.', 'error');
            });
    }

    // --- Event Listeners e Inicialização ---
    sortearBtn.addEventListener('click', sortearNumeros);
    copiarBtn.addEventListener('click', copiarResultado);
    limparHistoricoBtn.addEventListener('click', handleLimparHistorico); // Novo handler

    // Carrega o tema e o histórico ao carregar a página
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_TEMA) || '';
    applyTheme(savedTheme);
    renderThemeOptions();
    renderizarHistorico();
});