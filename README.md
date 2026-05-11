# Sherlock Holmes: Logic Engine

Bu proje; klasik dedektiflik oyun mekaniklerini, modern web teknolojileri ve dinamik bir mantık mimarisiyle birleştiren interaktif bir senaryo yönetim sistemidir. Yazılımın temel amacı, statik bir oyun deneyimi yerine, veriler arası ilişki kurabilen ve kullanıcı kararlarına göre şekillenen bir "Zihin Sarayı" simülasyonu sunmaktır.

### Websitemize aşağıdaki linkten ulaşabilirsiniz
https://sinemceng.github.io/logic_engine_website/

## Ekip Çalışması ve Liderlik
Bu proje, bir ekip çalışması ürünü olarak geliştirilmiştir. **Ekip Lideri** olarak, projenin en başından sonuna kadar teknik mimarinin kurgulanması, görev koordinasyonunun sağlanması ve ana mantık çekirdeğinin (Logic Core) geliştirilmesi süreçlerini yönettim. Projenin başarısı, ekip içerisindeki iş birliğinin teknik vizyonla birleştirilmesine dayanmaktadır.

## Teknik Derinlik ve Mimari

### Asenkron Veri Yönetimi (Asynchronous Data Fetching)
Sistem, kullanıcı deneyimini kesintiye uğratmamak adına tamamen asenkron bir veri akışı üzerine inşa edilmiştir. 
* **Non-blocking Yapı:** Oyun verileri (eşyalar, koordinatlar ve çıkarım kuralları), `data.json` dosyasından **Fetch API** kullanılarak asenkron olarak çekilir. Bu sayede, tarayıcının ana iş parçacığı (Main Thread) bloke edilmez ve veriler arka planda yüklenirken görsel animasyonlar (lila neon efektleri vb.) akıcı bir şekilde çalışmaya devam eder.
* **Promise Tabanlı Kontrol:** Verilerin tam olarak indiğinden emin olunmadan mantık motoru tetiklenmez; bu da uygulama genelinde veri tutarlılığını sağlar.

### Dinamik DOM Mekanizması ve Manipülasyonu
Projenin en kritik teknik özelliklerinden biri, HTML dosyasının statik bir içerik barındırmamasıdır.
* **Dinamik Enjeksiyon:** HTML dosyası sadece ana taşıyıcı (shell) görevini görür. JavaScript motoru, asenkron olarak aldığı verileri kullanarak tarayıcının hafızasındaki **DOM Ağacını (DOM Tree)** çalışma zamanında (runtime) inşa eder.
* **Node Yönetimi:** Her bir kanıt ve çıkarım, `document.createElement` ve `appendChild` gibi metotlarla "Düğüm" (Node) bazlı olarak sisteme enjekte edilir. Bu yaklaşım, sayfanın yenilenmesine (refresh) gerek kalmadan oyun dünyasının anlık olarak güncellenmesine olanak tanır.

### Esnek (Responsive) Tasarım Felsefesi
Proje, masaüstü kilitli ekran yapısından mobil cihazlara kadar her çözünürlüğe uyum sağlar.
* **Adaptif Mimari:** CSS Flexbox ve `@media` sorguları kullanılarak kurulan mimari sayesinde, ekran küçüldüğünde bileşenler "sıvı tasarım" kurallarına göre yeniden konumlandırılır. 
* **Öncelik Yönetimi:** Masaüstü görünümündeki katı görsel kuralları (height: 100vh gibi), mobil cihazlarda esnetebilmek adına stratejik olarak `!important` belirleyicileri kullanılmış ve böylece görsel bütünlük her cihazda korunmuştur.

## Öne Çıkan Mekanikler
* **Atmosferik Spotlight:** Fare koordinatlarını takip eden Radial Gradient tabanlı ışık efekti ile karanlık oda atmosferi güçlendirilmiştir.
* **Recursive Typewriter:** Sherlock'un analizlerini ekrana harf harf yazdıran, özyinelemeli (recursive) çalışan bir daktilo algoritması kullanılmıştır.
* **İpucu Algoritması:** 'Space' tuşu ile tetiklenen ve DOM üzerindeki henüz toplanmamış düğümleri (nodes) geçici olarak vurgulayan yardımcı bir sistem entegre edilmiştir.

# Bazı Görseller
- Oyun kuralları ekranı
<img width="1919" height="900" alt="image" src="https://github.com/user-attachments/assets/1b5c17d7-c4ca-4ac1-b02b-10f35a960b1a" />

- Vaka dosyası
<img width="1918" height="891" alt="image" src="https://github.com/user-attachments/assets/0d492faa-91b4-4420-8ee9-ddf229e6843c" />

- Oyun ekranı
<img width="1915" height="896" alt="image" src="https://github.com/user-attachments/assets/d0d1db8b-f4a9-4e32-8e7c-31fe53f1000f" />


## Kurulum
1. Repoyu yerel makinenize klonlayın.
2. Ana dizindeki `index.html` dosyasını bir yerel sunucu (örneğin VS Code Live Server) üzerinden çalıştırın.
*(Not: Tarayıcı güvenlik politikaları gereği, Fetch API'nin yerel dosya sistemindeki JSON verisini okuyabilmesi için yerel bir sunucu kullanımı zorunludur.)*
