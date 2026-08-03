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

    // Compteur de caractères
    inputText.addEventListener('input', () => {
        charCount.textContent = `${inputText.value.length}/500`;
    });

    // Effacer l'entrée
    clearBtn.addEventListener('click', () => {
        inputText.value = '';
        charCount.textContent = '0/500';
        inputText.focus();
    });

    // Envoi vers le Worker Cloudflare
    submitBtn.addEventListener('click', async () => {
        const text = inputText.value.trim();
        if (!text) return;

        // UI Loading State
        submitBtn.disabled = true;
        submitBtnText.textContent = 'Traitement...';
        placeholderText.classList.add('hidden');
        outputText.classList.add('hidden');
        loader.classList.remove('hidden');
        loader.classList.add('flex');
        copyBtn.disabled = true;

        try {
            // Remplace ci-dessous par l'URL de ton Worker Cloudflare créé dans la console
            const WORKER_URL = 'https://MON-WORKER.workers.dev';

            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            const data = await response.json();

            // Masquer le loader
            loader.classList.remove('flex');
            loader.classList.add('hidden');

            if (response.ok && data.result) {
                outputText.textContent = data.result;
                outputText.classList.remove('hidden');
                outputText.classList.add('fade-in-text');
                copyBtn.disabled = false;
            } else {
                outputText.textContent = "Erreur : " + (data.error || "Impossible de traiter le message.");
                outputText.classList.remove('hidden');
            }
        } catch (err) {
            loader.classList.remove('flex');
            loader.classList.add('hidden');
            outputText.textContent = "Erreur de connexion au serveur.";
            outputText.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtnText.textContent = 'Optimiser';
        }
    });

    // Copier dans le presse-papier
    copyBtn.addEventListener('click', () => {
        const textToCopy = outputText.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            copyBtnText.textContent = "Copié !";
            copyBtn.classList.add('bg-blue-600', 'text-white');
            setTimeout(() => {
                copyBtnText.textContent = "Copier";
                copyBtn.classList.remove('bg-blue-600', 'text-white');
            }, 2000);
        });
    });
});
