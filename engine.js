let gameData = null;
const inventory = [];
const TOTAL_ITEMS = 10;

// HTML'deki DOM elementlerini tekrar tekrar aramamak için bir objede topladım
const elements = {
    splash: document.getElementById('splash-screen'),
    info: document.getElementById('info-screen'),
    topBar: document.getElementById('top-bar'),
    gameContainer: document.getElementById('game-container'),
    
    btnStart: document.getElementById('btn-start-game'),
    btnBack: document.getElementById('back-to-menu-btn'),
    btnDeduce: document.getElementById('btn-deduce'),
    btnCombine: document.getElementById('btn-combine'),
    btnHelp: document.getElementById('help-icon'),
    btnStory: document.getElementById('story-icon'),
    storyModal: document.getElementById('story-modal'),
    btnCloseStory: document.getElementById('btn-close-story'),
    btnMute: document.getElementById('btn-mute'),
    
    objectLayer: document.getElementById('object-layer'),
    spotlight: document.getElementById('spotlight-layer'),
    typewriter: document.getElementById('typewriter-text'),
    clueCount: document.getElementById('clue-count'),
    deductionsList: document.getElementById('deductions-list'),

    solutionModal: document.getElementById('solution-modal'),
    finalStory: document.getElementById('final-story'),
    btnRestart: document.getElementById('btn-restart')
};

// Oyun içi ses objelerim (Ses seviyelerini kıstım ki oyuncuyu rahatsız etmesin)
const solveSound = new Audio('assets/success.mp3');
solveSound.volume = 0.4;

const bgMusic = new Audio('assets\\background.mp3'); 
bgMusic.volume = 0.3; 
bgMusic.loop = true;

// Oyunun durumunu ve birleştirilmek üzere seçilen kanıtları tuttuğum değişkenler
let isGameStarted = false; 
let selectedSlots = []; 


// İlk giriş ekranından kurallar ekranına geçiş animasyonu
elements.btnStart.addEventListener('click', () => {
    bgMusic.play();
    elements.splash.classList.add('fade-out');
    setTimeout(() => {
        elements.splash.classList.add('hidden');
        elements.info.classList.remove('hidden');
        elements.info.classList.remove('fade-out');
    }, 800);
});

// Arka plan müziğini durdurup başlatma ve ikonu toggle etme mantığı
elements.btnMute.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play();
        elements.btnMute.innerText = "🔊"; 
        elements.btnMute.style.boxShadow = "0 0 10px rgba(200, 162, 200, 0.3)"; 
    } else {
        bgMusic.pause();
        elements.btnMute.innerText = "🔇"; 
        elements.btnMute.style.boxShadow = "none"; 
    }
});

// Kuralları kapatıp oyuna geçiş işlemi (Oyun ilk kez başlıyorsa Vaka Dosyasını otomatik açıyorum)
elements.btnBack.addEventListener('click', () => {
    elements.info.classList.add('fade-out');
    setTimeout(() => {
        elements.info.classList.add('hidden');
        
        if (!isGameStarted) {
            elements.storyModal.classList.remove('hidden');
            elements.storyModal.style.display = 'flex';
        }
    }, 800);
});

// Oyuncu içerdeyken kuralları tekrar görmek isterse diye
elements.btnHelp.addEventListener('click', () => {
    elements.info.classList.remove('hidden', 'fade-out');
});


// JSON'dan oyun verilerini (ipuçları, lokasyonlar) asenkron olarak çekiyorum
async function loadGameData() {
    try {
        const res = await fetch('data.json');
        gameData = await res.json();
        
        gameData.deductions.forEach(d => d.isDiscovered = false);
        
        initScene();
    } catch (e) { 
        console.error("Veri yüklenirken hata oluştu:", e); 
    }
}

// JSON'dan gelen kanıtları DOM'a div olarak basıp koordinatlarını ayarlıyorum
function initScene() {
    const scene = gameData.scenes[0];
    scene.items.forEach(item => {
        const div = document.createElement('div');
        div.id = item.id; 
        div.className = 'collectible-item';
        
        div.style.top = item.coords.top; 
        div.style.left = item.coords.left;
        div.style.width = item.coords.w; 
        div.style.height = item.coords.h;
        
        div.onclick = () => tryCollectItem(item.id);
        elements.objectLayer.appendChild(div);
    });

    // Fare imlecini takip eden el feneri (spotlight) efekti algoritmam
    document.getElementById('scene-wrapper').addEventListener('mousemove', (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        elements.spotlight.style.background = `radial-gradient(circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, transparent 80px, rgba(0,0,0,0.85) 150px)`;
    });
}


// Ekranda 1.5 saniyelik kırmızı Toast uyarıları çıkarmak için kullandığım yardımcı fonksiyon
function showWarning(msg) {
    const toast = document.getElementById('game-toast');
    toast.innerText = msg;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 1500); 
}

// Oyuncu odada yanlış/boş bir yere tıklarsa uyarı fırlatıyorum
document.getElementById('scene-wrapper').addEventListener('click', (e) => {
    if (!e.target.classList.contains('collectible-item')) {
        showWarning("🕵️Zamanını boşa harcama, burada bir şey yok..");
    }
});

// Bir eşyaya tıklandığında envantere ekleme, odadan silme ve üst bara (slota) geçirme işlemi
function tryCollectItem(id) {
    if (inventory.includes(id)) return;
    
    const item = gameData.scenes[0].items.find(i => i.id === id);
    inventory.push(id);
    
    const itemEl = document.getElementById(id);
    itemEl.style.pointerEvents = "none";
    itemEl.style.opacity = "0";

    const slot = document.getElementById(`slot-${inventory.length - 1}`);
    if (slot) {
        slot.classList.add('filled'); 
        slot.innerHTML = item.icon || "🔍"; 
        
        slot.dataset.itemId = id; 
        slot.style.cursor = "pointer";
        slot.onclick = () => toggleSlotSelection(slot, id);
    }

    if(elements.clueCount) elements.clueCount.innerText = `${inventory.length}/${TOTAL_ITEMS}`;

    typeWriterEffect(item.text);
}

function checkDeductions() {
    gameData.deductions.forEach(d => {
        if (!d.isDiscovered && d.requiredItems.every(id => inventory.includes(id))) {
            d.isDiscovered = true;
            
            const li = document.createElement('li');
            li.style.color = "#c8a2c8"; 
            li.style.marginTop = "12px";
            li.innerText = "✔️ " + d.resultText;
            elements.deductionsList.appendChild(li);
        }
    });
} 
// Sherlock'un konuşmalarını daktilo gibi yazdırmak için recursive Timeout kullanıyorum
let daktiloZamanlayici = null; 
function typeWriterEffect(txt, el = elements.typewriter, speed = 30, cb = null) {
    // Üst üste yazıları engellemek için önce eski timer'ı temizliyorum
    if (daktiloZamanlayici) {
        clearTimeout(daktiloZamanlayici);
    }
    el.textContent = ""; 
    let i = 0;
    const type = () => { 
        if (i < txt.length) { 
            el.textContent += txt.charAt(i); 
            i++; 
            daktiloZamanlayici = setTimeout(type, speed); 
        } else if (cb) {
            cb(); 
        }
    };
    type();
}

// Oyuncu takılırsa Space tuşuyla odadaki bulunmamış eşyalardan birini kısa süreliğine parlatıyorum
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        const allItems = Array.from(document.querySelectorAll('.collectible-item'));
        const uncollectedItems = allItems.filter(item => !inventory.includes(item.id));
        
        if (uncollectedItems.length > 0) {
            const randomIndex = Math.floor(Math.random() * uncollectedItems.length);
            const hintItem = uncollectedItems[randomIndex];
            
            hintItem.style.boxShadow = "0 0 15px #c8a2c8";
            hintItem.style.border = "2px solid #c8a2c8";
            
            setTimeout(() => { 
                hintItem.style.boxShadow = "none"; 
                hintItem.style.border = "none"; 
            }, 800);
        } else {
            showWarning("🕵️ Odada bulman gereken başka bir şey kalmadı.");
        }
    }
});

// Final: Oyunu bitirme butonuna tıklandığında modalı açıp daktiloyla kapanış hikayesini yazdırıyorum
elements.btnDeduce.addEventListener('click', () => {
    bgMusic.pause();
    solveSound.play();

    elements.solutionModal.style.display = 'flex';

    typeWriterEffect(gameData.finalSolutionText, elements.finalStory, 40, () => {
        elements.btnRestart.style.display = 'inline-block';
    });
});

// Üst bardaki kanıtlara tıklandığında seçim array'ime ekleme/çıkarma yapıyorum (Maksimum 2 eşya)
function toggleSlotSelection(slot, itemId) {
    if (slot.classList.contains('selected')) {
        slot.classList.remove('selected');
        selectedSlots = selectedSlots.filter(s => s.id !== itemId);
    } else {
        if (selectedSlots.length < 2) {
            slot.classList.add('selected');
            selectedSlots.push({ element: slot, id: itemId });
        } else {
            showWarning("🕵️ Aynı anda sadece 2 ipucunu birleştirebilirsin!");
        }
    }
}

// Mantık Motoru: Seçilen 2 kanıtı JSON'daki kombinasyonlarla kıyaslayıp doğruysa çıkarım üretiyorum
elements.btnCombine.addEventListener('click', () => {
    
    // Validasyon: Tüm kanıtlar toplanmadan birleştirme yapılmasın
    if (inventory.length < TOTAL_ITEMS) {
        showWarning(`🕵️ Önce olay yerindeki tüm kanıtları (${inventory.length}/${TOTAL_ITEMS}) toplamalısın!`);
        return;
    }

    // Validasyon: Tam olarak 2 eşya seçilmemişse engelle
    if (selectedSlots.length !== 2) {
        showWarning("🕵️ Mantıklı bir çıkarım yapmak için 2 ipucu seçmelisin.");
        return;
    }

    const id1 = selectedSlots[0].id;
    const id2 = selectedSlots[1].id;

    let foundDeduction = null;
    gameData.deductions.forEach(d => {
        if (!d.isDiscovered && d.requiredItems.includes(id1) && d.requiredItems.includes(id2)) {
            foundDeduction = d;
        }
    });

    if (foundDeduction) {
        // Kanıtlar eşleştiyse listeye yeni madde olarak DOM üzerinden ekliyorum
        foundDeduction.isDiscovered = true;
        
        const li = document.createElement('li');
        li.style.color = "#c8a2c8"; 
        li.style.marginTop = "12px";
        li.innerText = "✔️ " + foundDeduction.resultText;
        elements.deductionsList.appendChild(li);

        typeWriterEffect("Sherlock: 'Mükemmel! Parçalar yerine oturuyor...'");
        
        // Bütün çıkarımlar bulunduysa final butonunu aktif hale getiriyorum
        const allDiscovered = gameData.deductions.every(d => d.isDiscovered);
        if (allDiscovered) {
            elements.btnDeduce.disabled = false;
            typeWriterEffect("Sherlock: 'İşte bu! Artık tüm tabloyu görebiliyorum. Vakayı çözmeye hazırım.'");
        }
    } else {
        typeWriterEffect("Sherlock: 'Hayır... Bu iki ipucu arasında mantıklı bir bağ yok. Tekrar düşünmeliyiz.'");
    }

    // İşlem bitince slottaki seçimleri temizliyorum
    selectedSlots.forEach(s => s.element.classList.remove('selected'));
    selectedSlots = [];
});

// Vaka dosyası butonları olay dinleyicileri
elements.btnStory.addEventListener('click', () => {
    elements.storyModal.classList.remove('hidden');
    elements.storyModal.style.display = 'flex'; 
});

elements.btnCloseStory.addEventListener('click', () => {
    elements.storyModal.classList.add('hidden');
    elements.storyModal.style.display = 'none';

    // Modal ilk kapandığında (oyun start aldığında) arayüzü görünür yapıyorum
    if (!isGameStarted) {
        isGameStarted = true; 
        elements.topBar.style.display = 'flex';
        
        typeWriterEffect("🕵️ Sherlock: Dosyayı okudun... Şimdi kanıtları bulmama yardım et, vaktimiz daralıyor.");
    }
});

// Sayfayı hard-reload yaparak oyunu sıfırlıyorum
elements.btnRestart.addEventListener('click', () => {
    window.location.reload(); 
});

// Uygulamayı tetikleyen ilk fonksiyon çağrısı
loadGameData();