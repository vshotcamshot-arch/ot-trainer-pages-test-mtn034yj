(function() {
    // Configuration based on Methodological TZ and Lesson Content
    const CONFIG = {
        correctZones: ['zone-feet', 'zone-pipe'],
        feedback: {
            consequence: {
                title: 'Риск падения',
                text: 'Лестница может соскользнуть по гладкому полу или сорваться с трубы, что приведет к падению работника и травмам.'
            },
            principle: {
                title: 'Нарушение принципов устойчивости',
                text: 'На скользкой поверхности необходимы меры против смещения. Верхние концы нельзя опирать на неустойчивые конструкции (трубы).'
            },
            explanation: {
                title: 'Правильный аудит',
                text: '<strong>Нарушения:</strong><br>1. Гладкий пол без противоскользящих устройств.<br>2. Опора на водосточную трубу.<br><br><strong>Требование:</strong> На скользкой поверхности лестница применяется только при мерах, предотвращающих смещение. Верхние концы закрепляют за устойчивые конструкции; нельзя опирать лестницу на водосточные трубы.'
            },
            success: {
                title: 'Отлично!',
                text: 'Вы верно выявили все нарушения установки лестницы.'
            }
        }
    };

    let state = {
        selectedZones: new Set(),
        attempts: 0,
        isCompleted: false
    };

    // DOM Elements
    const zones = document.querySelectorAll('.interactive-zone');
    const checkBtn = document.getElementById('check-btn');
    const statusText = document.getElementById('selection-status');
    const feedbackOverlay = document.getElementById('feedback-overlay');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackText = document.getElementById('feedback-text');
    const closeFeedbackBtn = document.getElementById('close-feedback-btn');
    const retryBtn = document.getElementById('retry-btn');
    const feedbackContent = document.querySelector('.feedback-content');

    // Initialization
    function init() {
        zones.forEach(zone => {
            zone.addEventListener('click', () => toggleZone(zone));
            zone.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleZone(zone);
                }
            });
        });

        checkBtn.addEventListener('click', validateAnswer);
        closeFeedbackBtn.addEventListener('click', handleFeedbackClose);
        retryBtn.addEventListener('click', resetSelection);
        
        updateUI();
    }

    // Interaction Logic
    function toggleZone(zoneElement) {
        if (state.isCompleted) return;

        const id = zoneElement.id;
        if (state.selectedZones.has(id)) {
            state.selectedZones.delete(id);
            zoneElement.classList.remove('selected');
            zoneElement.setAttribute('aria-pressed', 'false');
        } else {
            state.selectedZones.add(id);
            zoneElement.classList.add('selected');
            zoneElement.setAttribute('aria-pressed', 'true');
        }
        updateUI();
    }

    function updateUI() {
        statusText.textContent = `Выбрано зон: ${state.selectedZones.size}`;
        checkBtn.disabled = state.selectedZones.size === 0;
    }

    function resetSelection() {
        state.selectedZones.clear();
        zones.forEach(z => {
            z.classList.remove('selected');
            z.setAttribute('aria-pressed', 'false');
        });
        hideFeedback();
        updateUI();
    }

    // Validation Logic
    function validateAnswer() {
        state.attempts++;
        
        const currentSelection = Array.from(state.selectedZones).sort().join(',');
        const correctSelection = CONFIG.correctZones.sort().join(',');
        const isCorrect = currentSelection === correctSelection;

        if (isCorrect) {
            showFeedback('success');
            state.isCompleted = true;
        } else {
            // Progressive feedback logic
            if (state.attempts === 1) {
                showFeedback('consequence');
            } else if (state.attempts === 2) {
                showFeedback('principle');
            } else {
                showFeedback('explanation');
            }
        }
    }

    // Feedback Handling
    function showFeedback(type) {
        const data = CONFIG.feedback[type];
        feedbackTitle.textContent = data.title;
        feedbackText.innerHTML = data.text;
        
        // Styling based on type
        feedbackContent.className = 'feedback-content';
        if (type === 'success') feedbackContent.classList.add('success');
        else feedbackContent.classList.add('error');

        // Button visibility logic
        if (type === 'success') {
            retryBtn.classList.add('hidden');
            closeFeedbackBtn.textContent = 'Завершить';
        } else {
            retryBtn.classList.remove('hidden');
            closeFeedbackBtn.textContent = 'Понятно';
            // If it's the full explanation (attempt >= 3), we might want to just let them read it,
            // but the TZ says "then gives full breakdown and repeat".
            // So Retry is always available on error.
        }

        feedbackOverlay.classList.remove('hidden');
    }

    function hideFeedback() {
        feedbackOverlay.classList.add('hidden');
    }

    function handleFeedbackClose() {
        if (state.isCompleted) {
            // Optional: Send completion signal to parent if needed
            // window.parent.postMessage({ type: 'completion', score: 100 }, '*');
            hideFeedback();
            // Disable interactions
            checkBtn.disabled = true;
            checkBtn.textContent = 'Осмотр завершен';
        } else {
            hideFeedback();
        }
    }

    // Start
    init();
})();