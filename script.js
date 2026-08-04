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
    const readTime = document.getElementById('readTime');
    const inputTitle = document.getElementById('inputTitle');
    
    const modeTabs = document.querySelectorAll('.mode-tab');
    const translateBar = document.getElementById('translateBar');
    const emailBar = document.getElementById('emailBar');
    const toneBtns = document.querySelectorAll('.tone-btn');
    const scenarioBtns = document.querySelectorAll('.scenario-btn');
    const outputLang = document.getElementById('outputLang');

    let currentMode = 'translate';
    let currentTone = 'standard';
    let currentScenario = 'invoice';
    let soundEnabled = false;

    const toggleSoundBtn = document.getElementById('toggleSoundBtn');
    const rootMessage = document.getElementById('rootMessage');
    const rootEasterEggBtn = document.getElementById('rootEasterEggBtn');
    const closeRootBubble = document.getElementById('closeRootBubble');
    const rootBubbleBox = document.getElementById('rootBubbleBox');

    const openVipModalBtn = document.getElementById('openVipModalBtn');
    const closeVipModalBtn = document.getElementById('closeVipModalBtn');
    const vipModal = document.getElementById('vipModal');
    const activateVipBtn = document.getElementById('activateVipBtn');
    const vipCodeInput = document.getElementById('vipCodeInput');
    const vipErrorMsg = document.getElementById('vipErrorMsg');
    const userBadge = document.getElementById('userBadge');
    
    const openVipProfileBtn = document.getElementById('openVipProfileBtn');
    const profileModal = document.getElementById('profileModal');
    const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const profileName = document.getElementById('profileName');
    const profileRole = document.getElementById('profileRole');
    const profileCompany = document.getElementById('profileCompany');

    const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const historyDrawer = document.getElementById('historyDrawer');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    // Gestion du Son Root (Text-to-Speech intégré)
    toggleSoundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
            toggleSoundBtn.innerHTML = `🔊 <span class="hidden sm:inline">Son Root (Actif)</span>`;
            toggleSoundBtn.classList.add('border-amber-500', 'text-amber-400');
            speakRoot("Mode sonore activé par Root. Je surveille ton clavier !");
        } else {
            toggleSoundBtn.innerHTML = `🔇 <span class="hidden sm:inline">Son Root</span>`;
            toggleSoundBtn.classList.remove('border-amber-500', 'text-amber-400');
        }
    });

    function speakRoot(text) {
        if (!soundEnabled || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
    }

    // Easter Egg Root
    const rootQuotes = [
        "J'ai analysé ton code. Il manque un test unitaire, mais t'assures !",
        "Attention, niveau de toxicité corporate élevé dans la pièce !",
        "Root est fier de toi. Continue de coder !",
        "Besoin d'un café ou d'une synergie agile ?"
    ];

    rootEasterEggBtn.addEventListener('click', () => {
        const randomQuote = rootQuotes[Math.floor(Math.random() * rootQuotes.length)];
        rootMessage.textContent = randomQuote;
        rootBubbleBox.classList.remove('hidden');
        speakRoot(randomQuote);
        showToast("🧡 Root est réveillé !");
    });

    closeRootBubble.addEventListener('click', () => {
        rootBubbleBox.classList.add('hidden');
    });

    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `pointer-events-auto px-4 py-2.5 rounded-xl text-xs font-medium shadow-xl border transition duration-300 fade-in flex items-center gap-2 ${
            type === 'success' ? 'bg-brand-panel border-brand-accent text-white' : 'bg-brand-panel border-amber-500 text-amber-400'
        }`;
        toast.innerHTML = `<span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            modeTabs.forEach(t => {
                t.classList.remove('bg-brand-accent', 'text-white');
                t.classList.add('text-gray-400');
            });
            tab.classList.add('bg-brand-accent', 'text-white');
            tab.classList.remove('text-gray-400');
            currentMode = tab.dataset.mode;

            if (currentMode === 'translate') {
                translateBar.classList.remove('hidden');
                translateBar.classList.add('flex');
                emailBar.classList.add('hidden');
                emailBar.classList.remove('flex');
                inputTitle.textContent = "MESSAGE BRUT / FRANC";
                inputText.placeholder = "Écrivez votre message sans filtre ici...";
            } else {
                translateBar.classList.add('hidden');
                translateBar.classList.remove('flex');
                emailBar.classList.remove('hidden');
                emailBar.classList.add('flex');
                inputTitle.textContent = "CONTEXTE OU NOTES BRUTES";
                inputText.placeholder = "Ex: Projet en retard à cause de l'équipe X...";
            }
            resetOutput();
        });
    });

    function checkVipStatus() {
        const isVip = localStorage.getItem('corp_translator_vip') === 'true';
        if (isVip) {
            userBadge.textContent = "Compte VIP Root 🌟";
            userBadge.className = "text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30";
            openVipModalBtn.innerHTML = `🌟 VIP Root Actif`;
            openVipProfileBtn.classList.remove('hidden');
            openVipProfileBtn.classList.add('flex');
            
            profileName.value = localStorage.getItem('corp_profile_name') || '';
            profileRole.value = localStorage.getItem('corp_profile_role') || '';
            profileCompany.value = localStorage.getItem('corp_profile_company') || '';
        }
    }
    checkVipStatus();

    openVipModalBtn.addEventListener('click', () => vipModal.classList.remove('hidden'));
    closeVipModalBtn.addEventListener('click', () => vipModal.classList.add('hidden'));
    openVipProfileBtn.addEventListener('click', () => profileModal.classList.remove('hidden'));
    closeProfileModalBtn.addEventListener('click', () => profileModal.classList.add('hidden'));

    saveProfileBtn.addEventListener('click', () => {
        localStorage.setItem('corp_profile_name', profileName.value.trim());
        localStorage.setItem('corp_profile_role', profileRole.value.trim());
        localStorage.setItem('corp_profile_company', profileCompany.value.trim());
        profileModal.classList.add('hidden');
        showToast('Profil VIP enregistré !');
    });

    activateVipBtn.addEventListener('click', () => {
        const code = vipCodeInput.value.trim();
        if (code === 'VIP-ROOT-2026') {
            localStorage.setItem('corp_translator_vip', 'true');
            vipModal.classList.add('hidden');
            checkVipStatus();
            showToast('Félicitations ! Pass VIP Root activé 🌟');
            speakRoot("Pass VIP Root activé avec succès.");
        } else {
            vipErrorMsg.classList.remove('hidden');
        }
    });

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

    scenarioBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            scenarioBtns.forEach(b => {
                b.classList.remove('bg-amber-500', 'text-black', 'font-semibold');
                b.classList.add('text-gray-400');
            });
            btn.classList.add('bg-amber-500', 'text-black', 'font-semibold');
            btn.classList.remove('text-gray-400');
            currentScenario = btn.dataset.scenario;
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
        readTime.classList.add('hidden');
    }

    function typeWriterEffect(text, element, callback) {
        element.textContent = '';
        element.classList.remove('hidden');
        let i = 0;
        function typing() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typing, 4);
            } else if (callback) {
                callback();
            }
        }
        typing();
    }

    async function processGeneration() {
        const text = inputText.value.trim();
        if (!text) return;

        submitBtn.disabled = true;
        submitBtnText.textContent = 'Génération...';
        placeholderText.classList.add('hidden');
        outputText.classList.add('hidden');
        outputActions.classList.add('hidden');
        loader.classList.remove('hidden');
        copyBtn.disabled = true;
        readTime.classList.add('hidden');

        const langInstruction = outputLang.value === 'en' 
            ? "Réponds UNIQUEMENT en anglais (Corporate English professionnel)." 
            : "Réponds UNIQUEMENT en français.";

        let finalPrompt = "";
        if (currentMode === 'translate') {
            let toneInstruction = "Rends ce message extrêmement professionnel et diplomatique.";
            if (currentTone === 'firm') toneInstruction = "Rends ce message poli mais ferme et direct.";
            else if (currentTone === 'ceo') toneInstruction = "Rends ce message ultra-concis et orienté ROI.";
            else if (currentTone === 'sarcastic') toneInstruction = "Rends ce message faussement flatteur et hypocrite.";
            finalPrompt = `Consignes : ${toneInstruction} ${langInstruction}\n\nMessage : "${text}"`;
        } else {
            let scenarioInstruction = currentScenario === 'blame' 
                ? "Rédige un e-mail officiel de redirection de responsabilité (dédouanement) prouvant par A+B que le problème ne vient pas de toi."
                : currentScenario === 'raise' 
                ? "Rédige un argumentaire d'entretien annuel / demande d'augmentation axé sur la valeur nette."
                : "Rédige un e-mail professionnel adapté au scénario.";
            finalPrompt = `Objectif : ${scenarioInstruction} ${langInstruction}\n\nContexte : "${text}"`;
        }

        const API_URL = 'https://corporate-translator.bonjour7858.workers.dev';

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: finalPrompt })
            });

            const data = await response.json();
            loader.classList.add('hidden');

            if (response.ok && data.result) {
                outputActions.classList.remove('hidden');
                copyBtn.disabled = false;
                readTime.textContent = `⏱️ Optimisé par Root`;
                readTime.classList.remove('hidden');

                typeWriterEffect(data.result, outputText, () => {
                    saveToHistory(text, data.result);
                    if (soundEnabled) {
                        speakRoot("Traduction validée par Root !");
                    }
                });
            } else {
                outputText.textContent = "Erreur : " + (data.error || "Problème serveur.");
                outputText.classList.remove('hidden');
            }
        } catch (err) {
            loader.classList.add('hidden');
            outputText.textContent = "Erreur de connexion.";
            outputText.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtnText.textContent = 'Optimiser';
        }
    }

    submitBtn.addEventListener('click', processGeneration);
    regenBtn.addEventListener('click', processGeneration);

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(outputText.textContent).then(() => {
            showToast('Copié dans le presse-papier !');
            copyBtnText.textContent = "Copié !";
            setTimeout(() => { copyBtnText.textContent = "Copier"; }, 2000);
        });
    });

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
            historyList.innerHTML = `<p class="text-gray-600 text-center py-8">Aucun historique.</p>`;
            return;
        }
        historyList.innerHTML = history.map(item => `
            <div class="p-3 bg-brand-dark rounded-xl border border-brand-border space-y-1.5 cursor-pointer hover:border-gray-600 transition" onclick="loadFromHistory('${encodeURIComponent(item.original)}', '${encodeURIComponent(item.result)}')">
                <div class="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>"${item.original.substring(0, 15)}..."</span>
                    <span>${item.date}</span>
                </div>
                <p class="text-gray-200 text-xs font-medium truncate">${item.result}</p>
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
        showToast('Historique vidé.', 'info');
    });
});
