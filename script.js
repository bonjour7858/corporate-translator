document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const charCount = document.getElementById('charCount');
    const outputText = document.getElementById('outputText');
    const placeholderText = document.getElementById('placeholderText');
    const loader = document.getElementById('loader');
    const submitBtn = document.getElementById('submitBtn');
    const submitBtnText = document.getElementById('submitBtnText');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const copyBtnText = document.getElementById('copyBtnText');
    const outputActions = document.getElementById('outputActions');
    const regenBtn = document.getElementById('regenBtn');
    
    const toneBtns = document.querySelectorAll('.tone-btn');
    const outputLang = document.getElementById('outputLang');
    let currentTone = 'standard';

    // Modal VIP & Système de compte local
    const openVipModalBtn = document.getElementById('openVipModalBtn');
    const closeVipModalBtn = document.getElementById('closeVipModalBtn');
    const vipModal = document.getElementById('vipModal');
    const activateVipBtn = document.getElementById('activateVipBtn');
    const vipCodeInput = document.getElementById('vipCodeInput');
    const vipErrorMsg = document.getElementById('vipErrorMsg');
    const userBadge = document.getElementById('userBadge');

    // Historique
    const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const historyDrawer = document.getElementById('historyDrawer');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    const API_URL = 'https://corporate-translator.bonjour7858.workers.dev';

    // --- SYSTÈMEME DE COMPTE : Vérification du Statut VIP local ---
    function checkVipStatus() {
        const isVip = localStorage.getItem('corp_translator_vip') === 'true';
        if (isVip) {
            userBadge.textContent = "Compte VIP 🌟";
            userBadge.className = "text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30";
            openVipModalBtn.innerHTML = `🌟 VIP Actif`;
        }
    }
    checkVipStatus();

    // Ouverture / Fermeture sécurisée de la modale VIP
    openVipModalBtn.addEventListener('click', () => {
        vipModal.classList.remove('hidden');
    });

    closeVipModalBtn.addEventListener('click', () => {
        vipModal.classList.add('hidden');
    });

    // Fermeture en cliquant en dehors de la modale
    vipModal.addEventListener('click', (e) => {
        if (e.target === vipModal) {
            vipModal.classList.add('hidden');
        }
    });

    // Activation du code secret VIP (fictif pour tester : VIP-BONJOUR-2026)
    activateVipBtn.addEventListener('click', () => {
        const code = vipCodeInput.value.trim();
        if (code === 'VIP-BONJOUR-2026') {
            localStorage.setItem('corp_translator_vip', 'true');
            vipModal.classList.add('hidden');
            checkVipStatus();
            alert('Compte mis à niveau ! Bienvenue dans l\'espace VIP.');
        } else {
            vipErrorMsg.textContent = "Code d'activation invalide.";
            vipErrorMsg.classList.remove('hidden');
        }
    });

    // --- Gestion des Tonalités ---
    toneBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toneBtns.forEach(b => {
                b.classList.remove('bg-brand-accent', 'text-white');
                b.classList.add('text-gray-400');
            });
            btn.classList.add('bg-brand-accent', 'text-white');
            btn.classList.remove('text-gray-400');
            currentTone = btn.dataset.tone;
        });
    });

    inputText.addEventListener('input', () => {
        charCount.textContent = `${inputText.value.length}/500`;
    });

    clearBtn.addEventListener('click', () => {
        inputText.value = '';
        charCount.textContent = '0/500';
        resetOutput();
        inputText.focus();
    });

    function resetOutput() {
        outputText.classList.add('hidden');
        outputActions.classList.add('hidden');
        placeholderText.classList.remove('hidden');
        copyBtn.disabled = true;
    }

    // --- Traduction ---
    async function translateText() {
        const text = inputText.value.trim();
        if (!text) return;

        submitBtn.disabled = true;
        submitBtnText.textContent = 'Optimisation...';
        placeholderText.classList.add('hidden');
        outputText.classList.add('hidden');
        outputActions.classList.add('hidden');
        loader.classList.remove('hidden');
        copyBtn.disabled = true;

        let toneInstruction = "Rends ce message extrêmement professionnel, diplomatique et élégant.";
        if (currentTone === 'firm') {
            toneInstruction = "Rends ce message poli mais extrêmement ferme, direct et sans équivoque (style passif-agressif corporate).";
        } else if (currentTone === 'ceo') {
            toneInstruction = "Rends ce message ultra-concis, percutant, orienté stratégie et ROI (style CEO).";
        }

        const langInstruction = outputLang.value === 'en' 
            ? "Réponds UNIQUEMENT en anglais (Corporate English professionnel)." 
            : "Réponds UNIQUEMENT en français.";

        const finalPrompt = `Consignes de style : ${toneInstruction} ${langInstruction}\n\nMessage brut à reformuler : "${text}"`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: finalPrompt })
            });

            const data = await response.json();
            loader.classList.add('hidden');

            if (response.ok && data.result) {
                outputText.textContent = data.result;
                outputText.classList.remove('hidden');
                outputActions.classList.remove('hidden');
                copyBtn.disabled = false;
                saveToHistory(text, data.result);
            } else {
                outputText.textContent = "Erreur : " + (data.error || "Impossible de traiter la demande.");
                outputText.classList.remove('hidden');
            }
        } catch (err) {
            loader.classList.add('hidden');
            outputText.textContent = "Erreur de connexion avec le serveur.";
            outputText.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtnText.textContent = 'Optimiser';
        }
    }

    submitBtn.addEventListener('click', translateText);
    regenBtn.addEventListener('click', translateText);

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(outputText.textContent).then(() => {
            copyBtnText.textContent = "Copié !";
            setTimeout(() => { copyBtnText.textContent = "Copier"; }, 2000);
        });
    });

    // --- Historique ---
    toggleHistoryBtn.addEventListener('click', () => {
        historyDrawer.classList.remove('translate-x-full');
        renderHistory();
    });

    closeHistoryBtn.addEventListener('click', () => {
        historyDrawer.classList.add('translate-x-full');
    });

    function saveToHistory(original, result) {
        let history = JSON.parse(localStorage.getItem('corp_translator_history') || '[]');
        history.unshift({ original, result, date: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
        if (history.length > 10) history.pop();
        localStorage.setItem('corp_translator_history', JSON.stringify(history));
    }

    function renderHistory() {
        let history = JSON.parse(localStorage.getItem('corp_translator_history') || '[]');
        if (history.length === 0) {
            historyList.innerHTML = `<p class="text-gray-600 text-center py-8">Aucun historique pour le moment.</p>`;
            return;
        }

        historyList.innerHTML = history.map(item => `
            <div class="p-3 bg-brand-dark rounded-xl border border-brand-border space-y-1.5 cursor-pointer hover:border-gray-600 transition" onclick="loadFromHistory('${encodeURIComponent(item.original)}', '${encodeURIComponent(item.result)}')">
                <div class="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>Brut: "${item.original.substring(0, 20)}..."</span>
                    <span>${item.date}</span>
                </div>
                <p class="text-gray-200 text-xs font-medium">${item.result}</p>
            </div>
        `).join('');
    }

    window.loadFromHistory = (orig, res) => {
        inputText.value = decodeURIComponent(orig);
        outputText.textContent = decodeURIComponent(res);
        placeholderText.classList.add('hidden');
        outputText.classList.remove('hidden');
        outputActions.classList.remove('hidden');
        copyBtn.disabled = false;
        historyDrawer.classList.add('translate-x-full');
    };

    clearHistoryBtn.addEventListener('click', () => {
        localStorage.removeItem('corp_translator_history');
        renderHistory();
    });
});
