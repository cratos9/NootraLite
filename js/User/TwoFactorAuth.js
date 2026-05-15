document.addEventListener('DOMContentLoaded', () => {
    const cameraContainer = document.getElementById('cam');
    const status = document.querySelector('.scan-status');
    const tokenForm = document.getElementById('token-form');
    const tokenInput = document.getElementById('token-input');

    let verified = false;

    const verifyWithServer = async (data, type = 'qr') => {
        if (verified) {
            return;
        }

        verified = true;

        if (status) {
            status.textContent = 'Verificando ' + (type === 'qr' ? 'código QR' : 'token') + '...';
        }

        try {
            const formData = new URLSearchParams();
            if (type === 'qr') {
                formData.append('qr_data', data);
            } else {
                formData.append('token', data);
            }

            const response = await fetch('VerifyTwoFactor.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                body: formData
            });

            const result = await response.json();

            if (result.ok) {
                if (status) {
                    status.textContent = 'Verificación correcta. Redirigiendo...';
                }
                if (html5QrCode && html5QrCode.isScanning) {
                    await html5QrCode.stop().catch(() => {});
                }
                window.location.href = result.redirect || '../Dashboard/index.php';
                return;
            }

            verified = false;
            if (status) {
                status.textContent = result.message || 'Verificación fallida. Intenta nuevamente.';
            }
            if (type === 'token') {
                tokenInput.value = '';
                tokenInput.focus();
            }
        } catch (error) {
            verified = false;
            if (status) {
                status.textContent = 'No fue posible verificar. Intenta nuevamente.';
            }
            console.error('Error al verificar:', error);
        }
    };

    if (tokenForm) {
        tokenForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = tokenInput.value.trim();
            if (token.length === 8 && /^\d{8}$/.test(token)) {
                await verifyWithServer(token, 'token');
            }
        });
    }

    let html5QrCode = null;

    if (!cameraContainer || typeof Html5Qrcode === 'undefined') {
        if (status) {
            status.textContent = 'Cámara no disponible. Usa el código de 8 dígitos.';
        }
        return;
    }

    html5QrCode = new Html5Qrcode('cam');

    const stopScanner = async () => {
        if (html5QrCode && html5QrCode.isScanning) {
            try {
                await html5QrCode.stop();
            } catch (error) {
                console.error('Error al detener la cámara:', error);
            }
        }
    };

    html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
            await verifyWithServer(decodedText, 'qr');
        },
        () => {}
    ).catch((error) => {
        if (status) {
            status.textContent = 'Cámara no disponible. Usa el código de 8 dígitos.';
        }
        console.error('Error al iniciar la cámara:', error);
    });
});