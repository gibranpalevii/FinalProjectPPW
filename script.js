document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav ul li'); // Mengubah dari a menjadi li untuk penanganan active class yang lebih baik
    const currentPath = window.location.pathname.split('/').pop(); // Mendapatkan nama file saat ini (misal: index.html)

    navLinks.forEach(li => {
        const link = li.querySelector('a');
        if (!link) return; // Pastikan ada link di dalam li

        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) { // Jika itu adalah anchor link di halaman yang sama
                e.preventDefault();
                // Smooth scroll ke elemen target
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
            // Jika bukan anchor link, biarkan default action (navigasi ke halaman lain)
        });

        // Logika untuk menandai menu aktif
        const linkPath = link.getAttribute('href');
        // Menangani kasus index.html atau root path
        if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active'); // Pastikan menghapus kelas aktif dari yang lain
        }
    });

    // Animasi saat scroll menggunakan Intersection Observer
    const sections = document.querySelectorAll('.section-padding');

    const observerOptions = {
        root: null, // Menggunakan viewport sebagai root
        rootMargin: '0px',
        threshold: 0.1 // Berapa persen dari elemen yang terlihat sebelum callback dipicu
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in'); // Tambahkan kelas untuk memicu animasi
                observer.unobserve(entry.target); // Hentikan observasi setelah animasi dipicu sekali
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // --- QRIS Payment Simulation (Modal) ---
    // Ini adalah bagian dari kode lama Anda yang saya pindahkan ke sini untuk kejelasan.
    // Namun, fungsionalitas QRIS di halaman donate.html akan ditangani oleh kode di bawahnya.
    const qrisModal = document.getElementById('qrisModal');
    const openQrisButton = document.getElementById('openQris');
    const closeQrisSpan = document.querySelector('#qrisModal .close-button'); // Lebih spesifik
    const qrisImage = document.getElementById('qris-code-image');
    const countdownElement = document.getElementById('qris-countdown'); // Ini akan bentrok dengan donate.html punya
    const paymentStatusElement = document.getElementById('payment-status');
    const confirmPaymentButton = document.getElementById('confirm-payment-btn');
    const newTransactionButton = document.getElementById('new-transaction-btn');
    const qrisInstruction = document.getElementById('qris-instruction');

    let countdownInterval;
    const paymentTimeLimit = 60; // seconds

    if (openQrisButton) {
        openQrisButton.addEventListener('click', function() {
            qrisModal.style.display = 'block';
            startQrisSimulation();
        });
    }

    if (closeQrisSpan) {
        closeQrisSpan.addEventListener('click', function() {
            qrisModal.style.display = 'none';
            resetQrisSimulation();
        });
    }

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target == qrisModal) {
            qrisModal.style.display = 'none';
            resetQrisSimulation();
        }
    });

    if (confirmPaymentButton) {
        confirmPaymentButton.addEventListener('click', function() {
            simulatePaymentConfirmation();
        });
    }

    if (newTransactionButton) {
        newTransactionButton.addEventListener('click', function() {
            startQrisSimulation();
        });
    }

    function startQrisSimulation() {
        // Reset previous states
        clearInterval(countdownInterval);
        qrisImage.src = 'https://via.placeholder.com/250?text=Scan+QRIS+Code'; // Placeholder QRIS
        paymentStatusElement.textContent = 'Menunggu Pembayaran...';
        paymentStatusElement.className = 'status-pending';
        confirmPaymentButton.style.display = 'block';
        newTransactionButton.style.display = 'none';
        qrisInstruction.style.display = 'block'; // Show instructions again for new transaction

        let timeLeft = paymentTimeLimit;
        countdownElement.textContent = `Waktu tersisa: ${timeLeft} detik`;

        countdownInterval = setInterval(() => {
            timeLeft--;
            countdownElement.textContent = `Waktu tersisa: ${timeLeft} detik`;
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                paymentStatusElement.textContent = 'Waktu habis! Transaksi dibatalkan.';
                paymentStatusElement.className = 'status-failed';
                confirmPaymentButton.style.display = 'none';
                newTransactionButton.style.display = 'block';
            }
        }, 1000);
    }

    function simulatePaymentConfirmation() {
        clearInterval(countdownInterval);
        paymentStatusElement.textContent = 'Pembayaran berhasil!';
        paymentStatusElement.className = 'status-success';
        confirmPaymentButton.style.display = 'none';
        newTransactionButton.style.display = 'block';
        qrisInstruction.style.display = 'none'; // Hide instructions on success
    }

    function resetQrisSimulation() {
        clearInterval(countdownInterval);
        countdownElement.textContent = '';
        paymentStatusElement.textContent = '';
        paymentStatusElement.className = '';
        confirmPaymentButton.style.display = 'block';
        newTransactionButton.style.display = 'none';
        qrisInstruction.style.display = 'block';
    }
    // --- END QRIS Payment Simulation (Modal) ---


    // --- Fungsionalitas Halaman Donasi (donate.html) ---
    // Pastikan kode ini hanya berjalan di halaman donate.html
    if (currentPath === 'donate.html') {
        // Variabel global untuk halaman donasi
        let currentDonationAmount = 0;
        let qrisPageTimer; // Timer khusus untuk QRIS di halaman donasi
        const qrisPageCountdownDuration = 5 * 60; // 5 menit

        // Element references untuk halaman donasi
        const donationCards = document.querySelectorAll('.donation-card');
        const selectedDonationAmountSpan = document.getElementById('selected-donation-amount');
        const customAmountInput = document.getElementById('custom-amount-input');
        const processDonationBtn = document.getElementById('process-donation-btn');
        const thankYouMessage = document.getElementById('thank-you-message');
        const donorNameInput = document.getElementById('donor-name');
        const donorEmailInput = document.getElementById('donor-email');
        const nameError = document.getElementById('name-error');
        const emailError = document.getElementById('email-error');
        const donationForm = document.getElementById('donationForm'); // Dapatkan form
        const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]'); // Radio button metode pembayaran
        const paymentMethodDetailsContainer = document.getElementById('paymentMethodDetails'); // Container detail metode pembayaran

        // Elemen khusus QRIS di halaman donasi
        const qrisPageCountdownSpan = document.createElement('span'); // Akan dibuat dinamis
        qrisPageCountdownSpan.id = 'qris-page-countdown'; // ID unik untuk menghindari bentrok
        qrisPageCountdownSpan.style.fontWeight = 'bold';
        qrisPageCountdownSpan.style.color = 'var(--primary-color)'; // Warna default

        // Inisialisasi tampilan nominal
        updateDonationDisplay(0);

        function updateDonationDisplay(amount) {
            if (amount > 0) {
                selectedDonationAmountSpan.textContent = 'Rp ' + amount.toLocaleString('id-ID');
            } else {
                selectedDonationAmountSpan.textContent = 'Rp 0';
            }
            currentDonationAmount = amount;
        }

        function validateEmail(email) {
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }

        function showError(element, message) {
            element.textContent = message;
            element.style.display = 'block';
            // Find the associated input to add/remove error class
            const inputElement = element.previousElementSibling || element.nextElementSibling;
            if (inputElement && (inputElement.tagName === 'INPUT' || inputElement.tagName === 'SELECT' || inputElement.tagName === 'TEXTAREA')) {
                inputElement.classList.add('input-error'); // Add error class to input
            }
        }

        function hideError(element) {
            element.textContent = '';
            element.style.display = 'none';
            // Find the associated input to add/remove error class
            const inputElement = element.previousElementSibling || element.nextElementSibling;
            if (inputElement && (inputElement.tagName === 'INPUT' || inputElement.tagName === 'SELECT' || inputElement.tagName === 'TEXTAREA')) {
                inputElement.classList.remove('input-error'); // Remove error class from input
            }
        }

        donationCards.forEach(card => {
            card.addEventListener('click', function() {
                donationCards.forEach(c => c.classList.remove('active-donation'));
                this.classList.add('active-donation');

                const amount = this.dataset.amount;
                if (amount === 'custom') {
                    customAmountInput.classList.add('show');
                    customAmountInput.value = '';
                    customAmountInput.focus();
                    updateDonationDisplay(0);
                } else {
                    customAmountInput.classList.remove('show');
                    updateDonationDisplay(parseInt(amount));
                }
                thankYouMessage.style.display = 'none';
                // Sembunyikan error saat memilih kartu baru
                hideError(nameError);
                hideError(emailError);
                // Reset existing input fields if any
                donorNameInput.value = '';
                donorEmailInput.value = '';
                document.getElementById('donor-message').value = '';

                // Reset payment method details when donation amount changes
                // Ini akan dipicu oleh event change pada radio button payment method
                // yang akan dipicu secara manual di bawah
                const checkedRadio = document.querySelector('input[name="payment-method"]:checked');
                if (checkedRadio) {
                    checkedRadio.dispatchEvent(new Event('change')); // Panggil event change secara manual
                }
            });
        });

        customAmountInput.addEventListener('input', function() {
            const value = parseInt(this.value);
            if (!isNaN(value) && value > 0) {
                updateDonationDisplay(value);
            } else {
                updateDonationDisplay(0);
            }
            hideError(nameError); // Sembunyikan error saat input kustom berubah
            hideError(emailError);
        });

        // Event listener untuk validasi real-time pada input nama
        donorNameInput.addEventListener('input', function() {
            if (donorNameInput.value.trim() !== '') {
                hideError(nameError);
            }
        });

        // Event listener untuk validasi real-time pada input email
        donorEmailInput.addEventListener('input', function() {
            if (validateEmail(donorEmailInput.value.trim())) {
                hideError(emailError);
            }
        });

        // --- START: Payment Method Details & QRIS Countdown for donate.html ---
        function updatePaymentDetailsDisplay() {
            const selectedMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
            let detailsHtml = '';

            // Clear all specific error messages related to payment inputs
            ['cardNumber-error', 'expiryDate-error', 'cvv-error', 'cardName-error', 'transferProof-error'].forEach(id => {
                const errorElement = document.getElementById(id);
                if (errorElement) hideError(errorElement);
            });

            // Hentikan timer QRIS jika beralih dari metode QRIS
            if (qrisPageTimer) {
                clearInterval(qrisPageTimer);
            }

            if (selectedMethod === 'bank_transfer') {
                detailsHtml = `
                    <h4>Instruksi Pembayaran Bank Transfer</h4>
                    <p>Silakan transfer donasi Anda ke salah satu rekening berikut:</p>
                    <ul>
                        <li><strong>Bank Mandiri:</strong> 1234-5678-9012 (a.n. Peduli Hutan)</li>
                        <li><strong>Bank BCA:</strong> 9876-5432-1098 (a.n. Peduli Hutan)</li>
                        <li><strong>Bank BRI:</strong> 1122-3344-5566 (a.n. Peduli Hutan)</li>
                    </ul>
                    <p>Mohon masukkan nominal donasi yang sesuai dan tambahkan catatan "Donasi Peduli Hutan" jika memungkinkan.</p>
                    <p>Setelah transfer, konfirmasikan pembayaran Anda melalui email atau formulir konfirmasi yang akan muncul setelah Anda klik 'Lanjutkan Pembayaran'.</p>
                    <div class="form-group">
                        <label for="transferProof">Unggah Bukti Transfer (Opsional)</label>
                        <input type="file" id="transferProof" accept="image/*,application/pdf">
                        <div class="error-message" id="transferProof-error"></div>
                        <small>Ukuran file maksimal 2MB (JPG, PNG, PDF)</small>
                    </div>
                `;
            } else if (selectedMethod === 'e_wallet') {
                detailsHtml = `
                    <h4>Instruksi Pembayaran E-wallet</h4>
                    <p>Pilih e-wallet Anda dan ikuti instruksi yang muncul:</p>
                    <div class="e-wallet-options">
                        <button type="button" class="btn btn-e-wallet" data-wallet="gopay"><img src="images/gopay.png" alt="GoPay"> GoPay</button>
                        <button type="button" class="btn btn-e-wallet" data-wallet="ovo"><img src="images/OVO.png" alt="OVO"> OVO</button>
                        <button type="button" class="btn btn-e-wallet" data-wallet="dana"><img src="images/dana.png" alt="Dana"> Dana</button>
                    </div>
                    <div id="eWalletInstructions" style="margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px;">
                        <p>Silakan pilih salah satu opsi e-wallet di atas untuk melihat instruksi pembayaran.</p>
                    </div>
                    <p>Anda akan diarahkan ke aplikasi e-wallet Anda atau kode QR akan ditampilkan untuk pembayaran.</p>
                `;
            } else if (selectedMethod === 'qris') {
                detailsHtml = `
                    <h4>Instruksi Pembayaran QRIS</h4>
                    <p>Scan QR Code di bawah menggunakan aplikasi pembayaran favorit Anda (GoPay, OVO, DANA, Mobile Banking, dll.)</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <img src="https://via.placeholder.com/200?text=QRIS+Code" alt="QRIS Code" style="width: 200px; height: 200px; border: 1px solid #eee; border-radius: 5px; display: block; margin: 0 auto;">
                        <p style="font-size: 0.9em; margin-top: 10px;">Kode berlaku dalam: <span id="qris-page-countdown" style="font-weight: bold; color: var(--primary-color);">05:00</span></p>
                        <p style="font-size: 0.9em;">Nominal: Rp <span id="qris-amount-display">${currentDonationAmount.toLocaleString('id-ID')}</span></p>
                    </div>
                    <p><strong>Panduan Pembayaran:</strong></p>
                    <ol style="list-style-type: decimal; margin-left: 20px;">
                        <li>Buka aplikasi pembayaran di ponsel Anda.</li>
                        <li>Pindai kode QR di atas.</li>
                        <li>Pastikan nominal sesuai dengan donasi Anda.</li>
                        <li>Selesaikan pembayaran.</li>
                        <li>Konfirmasi otomatis akan dikirim ke email Anda.</li>
                    </ol>
                `;
                // Setelah HTML dimuat, ambil elemen countdown dan mulai timer
                setTimeout(() => {
                    const qrisPageCountdownSpanElement = document.getElementById('qris-page-countdown');
                    if (qrisPageCountdownSpanElement) {
                        startQrisPageCountdown(qrisPageCountdownSpanElement);
                    }
                    const qrisAmountDisplay = document.getElementById('qris-amount-display');
                    if (qrisAmountDisplay) {
                        qrisAmountDisplay.textContent = currentDonationAmount.toLocaleString('id-ID');
                    }
                }, 0); // Jalankan setelah DOM diperbarui
            } else if (selectedMethod === 'credit_card') {
                detailsHtml = `
                    <h4>Instruksi Pembayaran Kartu Kredit</h4>
                    <p>Masukkan detail kartu kredit Anda. Pembayaran akan diproses melalui gateway pembayaran yang aman.</p>
                    <div class="form-group">
                        <label for="cardNumber">Nomor Kartu</label>
                        <input type="text" id="cardNumber" placeholder="xxxx xxxx xxxx xxxx" maxlength="19" required>
                        <div class="error-message" id="cardNumber-error"></div>
                    </div>
                    <div style="display: flex; gap: 15px;">
                        <div class="form-group" style="flex: 1;">
                            <label for="expiryDate">Tanggal Kadaluarsa</label>
                            <input type="text" id="expiryDate" placeholder="MM/YY" maxlength="5" required>
                            <div class="error-message" id="expiryDate-error"></div>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label for="cvv">CVV</label>
                            <input type="text" id="cvv" placeholder="xxx" maxlength="4" required>
                            <div class="error-message" id="cvv-error"></div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="cardName">Nama Pemegang Kartu</label>
                        <input type="text" id="cardName" placeholder="Nama sesuai kartu" required>
                        <div class="error-message" id="cardName-error"></div>
                    </div>
                    <p class="small-text">Transaksi Anda aman dan terenkripsi. Kami tidak menyimpan detail kartu kredit Anda.</p>
                `;
            } else {
                detailsHtml = `<p>Pilih metode pembayaran untuk melihat instruksi.</p>`;
            }
            paymentMethodDetailsContainer.innerHTML = detailsHtml;

            // Add event listeners for e-wallet buttons if they exist
            if (selectedMethod === 'e_wallet') {
                document.querySelectorAll('.btn-e-wallet').forEach(button => {
                    button.addEventListener('click', function() {
                        const wallet = this.dataset.wallet;
                        const eWalletInstructionsDiv = document.getElementById('eWalletInstructions');
                        let walletInstruction = '';
                        if (wallet === 'gopay') {
                            walletInstruction = `
                                <h5>Instruksi GoPay:</h5>
                                <p>1. Buka aplikasi GoPay Anda.</p>
                                <p>2. Scan QR Code yang akan muncul setelah Anda klik 'Lanjutkan Pembayaran'.</p>
                                <p>3. Masukkan PIN GoPay Anda untuk menyelesaikan pembayaran.</p>
                            `;
                        } else if (wallet === 'ovo') {
                            walletInstruction = `
                                <h5>Instruksi OVO:</h5>
                                <p>1. Buka aplikasi OVO Anda.</p>
                                <p>2. Scan QR Code atau masukkan nomor tujuan pembayaran.</p>
                                <p>3. Konfirmasi pembayaran dan masukkan PIN OVO Anda.</p>
                            `;
                        } else if (wallet === 'dana') {
                            walletInstruction = `
                                <h5>Instruksi DANA:</h5>
                                <p>1. Buka aplikasi DANA Anda.</p>
                                <p>2. Scan QR Code atau masukkan nomor tujuan pembayaran.</p>
                                <p>3. Ikuti instruksi di aplikasi DANA untuk menyelesaikan transaksi.</p>
                            `;
                        }
                        eWalletInstructionsDiv.innerHTML = walletInstruction;
                    });
                });
            }

            // Add real-time validation for credit card fields if they become visible
            if (selectedMethod === 'credit_card') {
                const cardNumberInput = document.getElementById('cardNumber');
                const expiryDateInput = document.getElementById('expiryDate');
                const cvvInput = document.getElementById('cvv');
                const cardNameInput = document.getElementById('cardName');

                if (cardNumberInput) {
                    cardNumberInput.addEventListener('input', function() {
                        this.value = this.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
                        if (this.value.trim().length === 19 && /^\d{4} \d{4} \d{4} \d{4}$/.test(this.value.trim())) {
                            hideError(document.getElementById('cardNumber-error'));
                        } else {
                            showError(document.getElementById('cardNumber-error'), 'Nomor kartu tidak valid (format xxxx xxxx xxxx xxxx).');
                        }
                    });
                }
                if (expiryDateInput) {
                    expiryDateInput.addEventListener('input', function() {
                        this.value = this.value.replace(/\D/g, '');
                        if (this.value.length > 2) {
                            this.value = this.value.substring(0, 2) + '/' + this.value.substring(2, 4);
                        }
                        if (/^(0[1-9]|1[0-2])\/\d{2}$/.test(this.value.trim())) {
                            const [month, year] = this.value.trim().split('/').map(Number);
                            const currentYear = new Date().getFullYear() % 100;
                            const currentMonth = new Date().getMonth() + 1;

                            if (year < currentYear || (year === currentYear && month < currentMonth)) {
                                showError(document.getElementById('expiryDate-error'), 'Kartu sudah kadaluarsa.');
                            } else {
                                hideError(document.getElementById('expiryDate-error'));
                            }
                        } else {
                            showError(document.getElementById('expiryDate-error'), 'Tanggal kadaluarsa tidak valid (format MM/YY).');
                        }
                    });
                }
                if (cvvInput) {
                    cvvInput.addEventListener('input', function() {
                        this.value = this.value.replace(/\D/g, '');
                        if (this.value.trim().length >= 3 && this.value.trim().length <= 4) {
                            hideError(document.getElementById('cvv-error'));
                        } else {
                            showError(document.getElementById('cvv-error'), 'CVV tidak valid (3 atau 4 digit).');
                        }
                    });
                }
                if (cardNameInput) {
                    cardNameInput.addEventListener('input', function() {
                        if (this.value.trim() !== '') {
                            hideError(document.getElementById('cardName-error'));
                        } else {
                            showError(document.getElementById('cardName-error'), 'Nama pemegang kartu wajib diisi.');
                        }
                    });
                }
            }
        }

        // Fungsi untuk memulai/mereset countdown QRIS di halaman donasi
        function startQrisPageCountdown(countdownElement) {
            // Hentikan timer sebelumnya jika ada
            if (qrisPageTimer) {
                clearInterval(qrisPageTimer);
            }

            let remainingTime = qrisPageCountdownDuration;

            function updateDisplay() {
                const minutes = Math.floor(remainingTime / 60);
                const seconds = remainingTime % 60;
                countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                if (remainingTime < 60) { // Kurang dari 1 menit, ubah warna jadi merah
                    countdownElement.style.color = 'var(--error)'; // Menggunakan variabel CSS --error
                } else {
                    countdownElement.style.color = 'var(--primary-color)'; // Kembali ke warna default
                }
            }

            updateDisplay(); // Update tampilan segera

            qrisPageTimer = setInterval(() => {
                remainingTime--;
                updateDisplay();

                if (remainingTime <= 0) {
                    clearInterval(qrisPageTimer);
                    countdownElement.textContent = '00:00';
                    // Opsional: Tampilkan pesan bahwa QRIS sudah kadaluarsa
                    alert('Kode QRIS telah kedaluwarsa. Silakan pilih metode pembayaran lain atau muat ulang halaman.');
                }
            }, 1000);
        }

        // Attach event listeners to all payment method radio buttons
        paymentMethodRadios.forEach(radio => {
            radio.addEventListener('change', updatePaymentDetailsDisplay);
        });

        // Initial display based on default checked radio (if any)
        // Panggil ini setelah semua fungsi updatePaymentDetailsDisplay dan startQrisPageCountdown didefinisikan
        const initialCheckedRadio = document.querySelector('input[name="payment-method"]:checked');
        if (initialCheckedRadio) {
            initialCheckedRadio.dispatchEvent(new Event('change'));
        } else {
            // Jika tidak ada yang tercentang, tampilkan pesan default
            paymentMethodDetailsContainer.innerHTML = `<p>Pilih metode pembayaran untuk melihat instruksi.</p>`;
        }

        // --- END: Payment Method Details & QRIS Countdown for donate.html ---

        processDonationBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Mencegah submit form default

            let isValid = true;

            // Validasi jumlah donasi
            if (currentDonationAmount <= 0) {
                alert('Mohon pilih jumlah donasi atau masukkan jumlah nominal yang valid.');
                isValid = false;
            }

            // Validasi nama
            if (donorNameInput.value.trim() === '') {
                showError(nameError, 'Nama lengkap tidak boleh kosong.');
                isValid = false;
            } else {
                hideError(nameError);
            }

            // Validasi email
            if (donorEmailInput.value.trim() === '') {
                showError(emailError, 'Email tidak boleh kosong.');
                isValid = false;
            } else if (!validateEmail(donorEmailInput.value.trim())) {
                showError(emailError, 'Format email tidak valid.');
                isValid = false;
            } else {
                hideError(emailError);
            }

            // --- Additional validation for dynamic payment fields ---
            const selectedMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
            if (selectedMethod === 'credit_card') {
                const cardNumberInput = document.getElementById('cardNumber');
                const expiryDateInput = document.getElementById('expiryDate');
                const cvvInput = document.getElementById('cvv');
                const cardNameInput = document.getElementById('cardName');

                if (cardNumberInput && (cardNumberInput.value.trim().length !== 19 || !/^\d{4} \d{4} \d{4} \d{4}$/.test(cardNumberInput.value.trim()))) {
                    showError(document.getElementById('cardNumber-error'), 'Nomor kartu tidak valid (format xxxx xxxx xxxx xxxx).');
                    isValid = false;
                } else if (cardNumberInput) {
                    hideError(document.getElementById('cardNumber-error'));
                }

                if (expiryDateInput) {
                    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDateInput.value.trim())) {
                        showError(document.getElementById('expiryDate-error'), 'Tanggal kadaluarsa tidak valid (format MM/YY).');
                        isValid = false;
                    } else {
                        const [month, year] = expiryDateInput.value.trim().split('/').map(Number);
                        const currentYear = new Date().getFullYear() % 100;
                        const currentMonth = new Date().getMonth() + 1;

                        if (year < currentYear || (year === currentYear && month < currentMonth)) {
                            showError(document.getElementById('expiryDate-error'), 'Kartu sudah kadaluarsa.');
                            isValid = false;
                        } else {
                            hideError(document.getElementById('expiryDate-error'));
                        }
                    }
                }

                if (cvvInput && (cvvInput.value.trim().length < 3 || cvvInput.value.trim().length > 4 || !/^\d+$/.test(cvvInput.value.trim()))) {
                    showError(document.getElementById('cvv-error'), 'CVV tidak valid (3 atau 4 digit).');
                    isValid = false;
                } else if (cvvInput) {
                    hideError(document.getElementById('cvv-error'));
                }

                if (cardNameInput && cardNameInput.value.trim() === '') {
                    showError(document.getElementById('cardName-error'), 'Nama pemegang kartu wajib diisi.');
                    isValid = false;
                } else if (cardNameInput) {
                    hideError(document.getElementById('cardName-error'));
                }
            } else if (selectedMethod === 'bank_transfer') {
                // Optional: add validation for transferProof if it becomes mandatory
                // const transferProofInput = document.getElementById('transferProof');
                // if (transferProofInput && transferProofInput.files.length === 0) {
                //     showError(document.getElementById('transferProof-error'), 'Mohon unggah bukti transfer.');
                //     isValid = false;
                // } else if (transferProofInput) {
                //     hideError(document.getElementById('transferProof-error'));
                // }
            }
            // --- END: Additional validation for dynamic payment fields ---


            if (isValid) {
                // Simulasi proses pembayaran
                console.log('Donasi diproses untuk jumlah: Rp ' + currentDonationAmount.toLocaleString('id-ID'));
                console.log('Nama: ' + donorNameInput.value.trim());
                console.log('Email: ' + donorEmailInput.value.trim());
                console.log('Pesan: ' + (document.getElementById('donor-message').value || 'Tidak diisi'));
                console.log('Metode Pembayaran: ' + selectedMethod);

                if (selectedMethod === 'credit_card') {
                    console.log('Nomor Kartu: ' + document.getElementById('cardNumber').value.trim());
                    console.log('Tanggal Kadaluarsa: ' + document.getElementById('expiryDate').value.trim());
                    // CVV dan nama tidak dicetak untuk keamanan dalam log publik
                } else if (selectedMethod === 'bank_transfer') {
                    const transferProofInput = document.getElementById('transferProof');
                    if (transferProofInput && transferProofInput.files.length > 0) {
                        console.log('Bukti Transfer Terunggah:', transferProofInput.files[0].name);
                    }
                }

                // Tampilkan pesan terima kasih
                thankYouMessage.style.display = 'block';

                // Reset formulir setelah beberapa detik
                setTimeout(() => {
                    donationCards.forEach(c => c.classList.remove('active-donation'));
                    customAmountInput.classList.remove('show');
                    customAmountInput.value = '';
                    donorNameInput.value = '';
                    donorEmailInput.value = '';
                    document.getElementById('donor-message').value = '';
                    updateDonationDisplay(0);
                    thankYouMessage.style.display = 'none'; // Sembunyikan pesan terima kasih
                    // Reset radio buttons and dynamic content
                    paymentMethodRadios.forEach(radio => radio.checked = false);
                    // Panggil updatePaymentDetailsDisplay untuk mereset tampilan instruksi
                    const defaultRadio = document.querySelector('input[name="payment-method"][value="bank_transfer"]');
                    if (defaultRadio) {
                        defaultRadio.checked = true;
                        defaultRadio.dispatchEvent(new Event('change'));
                    } else {
                        paymentMethodDetailsContainer.innerHTML = `<p>Pilih metode pembayaran untuk melihat instruksi.</p>`;
                    }
                }, 3000); // Sembunyikan setelah 3 detik
            }
        });

        // --- Fungsionalitas Accordion (Pertanyaan Umum) ---
        const accordionButtons = document.querySelectorAll('.accordion-btn');

        accordionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const accordionItem = this.parentElement;
                const content = accordionItem.querySelector('.accordion-content');

                // Toggle active class
                accordionItem.classList.toggle('active');

                // Toggle display of content
                if (accordionItem.classList.contains('active')) {
                    content.style.display = 'block';
                } else {
                    content.style.display = 'none';
                }
            });
        });
    }

    // --- Logic for Contact Page (if applicable) ---
    // Ensure this block only runs on contact.html if 'subject' and 'otherSubjectGroup' are specific to it
    if (currentPath === 'contact.html') {
        const subjectSelect = document.getElementById('subject');
        // Pastikan elemen ini ada di contact.html, jika tidak, tambahkan atau hapus referensinya
        const otherSubjectGroup = document.getElementById('otherSubjectGroup'); 
        const otherSubjectInput = document.getElementById('otherSubject');

        if (subjectSelect && otherSubjectGroup && otherSubjectInput) {
            subjectSelect.addEventListener('change', function() {
                if (this.value === 'other') { // Assuming 'other' is the value for 'Lainnya'
                    otherSubjectGroup.style.display = 'block';
                    otherSubjectInput.setAttribute('required', 'required'); // Make it required when visible
                } else {
                    otherSubjectGroup.style.display = 'none';
                    otherSubjectInput.removeAttribute('required');
                    otherSubjectInput.value = ''; // Clear the input when hidden
                }
            });

            // Initial check in case the page is loaded with 'other' pre-selected (unlikely but good practice)
            if (subjectSelect.value === 'other') {
                otherSubjectGroup.style.display = 'block';
                otherSubjectInput.setAttribute('required', 'required');
            }
        }

        // Existing form submission and validation logic for contact form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function(event) {
                event.preventDefault(); // Prevent default form submission

                let isValid = true;

                // Clear previous error messages
                document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

                // Validate Name
                const nameInput = document.getElementById('name');
                if (nameInput.value.trim() === '') {
                    showError(document.getElementById('name-error'), 'Nama lengkap wajib diisi.');
                    isValid = false;
                } else {
                    hideError(document.getElementById('name-error'));
                }

                // Validate Email
                const emailInput = document.getElementById('email');
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailInput.value.trim() === '') {
                    showError(document.getElementById('email-error'), 'Alamat email wajib diisi.');
                    isValid = false;
                } else if (!emailPattern.test(emailInput.value.trim())) {
                    showError(document.getElementById('email-error'), 'Format email tidak valid.');
                    isValid = false;
                } else {
                    hideError(document.getElementById('email-error'));
                }

                // Validate Subject (Dropdown)
                if (subjectSelect && subjectSelect.value === '') {
                    showError(document.getElementById('subject-error'), 'Subjek pesan wajib dipilih.');
                    isValid = false;
                } else if (subjectSelect) {
                    hideError(document.getElementById('subject-error'));
                }

                // Validate Other Subject (if visible)
                if (otherSubjectGroup && otherSubjectGroup.style.display === 'block' && otherSubjectInput.value.trim() === '') {
                    showError(document.getElementById('otherSubject-error'), 'Subjek spesifik wajib diisi.');
                    isValid = false;
                } else if (otherSubjectGroup) {
                    hideError(document.getElementById('otherSubject-error'));
                }


                // Validate Message
                const messageInput = document.getElementById('message');
                if (messageInput.value.trim() === '') {
                    showError(document.getElementById('message-error'), 'Pesan wajib diisi.');
                    isValid = false;
                } else {
                    hideError(document.getElementById('message-error'));
                }

                const formStatus = document.getElementById('form-status');
                if (isValid) {
                    formStatus.textContent = 'Pesan Anda berhasil dikirim!';
                    formStatus.style.backgroundColor = '#e8f5e9';
                    formStatus.style.color = '#2e7d32';
                    // You would typically send the form data to a server here
                    // For demonstration, we'll just log it
                    console.log('Form Submitted:', {
                        name: nameInput.value,
                        email: emailInput.value,
                        subject: subjectSelect.value === 'other' ? otherSubjectInput.value : subjectSelect.value,
                        message: messageInput.value
                    });
                    contactForm.reset(); // Clear form fields on successful submission
                    if (otherSubjectGroup) { // Pastikan elemen ada sebelum diakses
                        otherSubjectGroup.style.display = 'none'; // Hide other subject input
                        otherSubjectInput.removeAttribute('required'); // Remove required attribute
                        otherSubjectInput.value = ''; // Clear other subject input
                    }
                } else {
                    formStatus.textContent = 'Mohon periksa kembali input Anda.';
                    formStatus.style.backgroundColor = '#ffebee';
                    formStatus.style.color = '#c62828';
                }
            });
        }
    }
});
