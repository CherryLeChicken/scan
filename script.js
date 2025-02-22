document.addEventListener('DOMContentLoaded', function () {
    const infoDiv = document.getElementById('product-info');
    const restartBtn = document.getElementById('restart-btn');
    const startBtn = document.getElementById('btn');
    let scannerIsRunning = false;

    async function fetchCanadianAlternatives(productName) {
        try {
            const response = await fetch('/fetch-alternatives', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productName }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.alternatives;
        } catch (error) {
            console.error('Error fetching alternatives:', error);
            return 'Unable to fetch alternatives at this time.';
        }
    }

    function startScanner() {
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: document.querySelector('#scanner-container'),
                constraints: {
                    width: 480,
                    height: 320,
                    facingMode: "environment" // Use the rear camera
                },
            },
            decoder: {
                readers: [
                    "code_128_reader",
                    "ean_reader",
                    "ean_8_reader",
                    "code_39_reader",
                    "code_39_vin_reader",
                    "codabar_reader",
                    "upc_reader",
                    "upc_e_reader",
                    "i2of5_reader"
                ],
                debug: {
                    showCanvas: true,
                    showPatches: true,
                    showFoundPatches: true,
                    showSkeleton: true,
                    showLabels: true,
                    showPatchLabels: true,
                    showRemainingPatchLabels: true,
                    boxFromPatches: {
                        showTransformed: true,
                        showTransformedBox: true,
                        showBB: true
                    }
                }
            },
        }, function (err) {
            if (err) {
                console.error(err);
                return;
            }
            console.log("Initialization finished. Ready to start");
            Quagga.start();
            scannerIsRunning = true;
        });

        Quagga.onProcessed(function (result) {
            var drawingCtx = Quagga.canvas.ctx.overlay,
                drawingCanvas = Quagga.canvas.dom.overlay;

            if (result) {
                if (result.boxes) {
                    drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                    result.boxes.filter(function (box) {
                        return box !== result.box;
                    }).forEach(function (box) {
                        Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
                    });
                }

                if (result.box) {
                    Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
                }

                if (result.codeResult && result.codeResult.code) {
                    Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
                }
            }
        });

        Quagga.onDetected(async function (result) {
            const code = result.codeResult.code;
            console.log("Barcode detected: " + code);
            infoDiv.textContent = "Processing barcode...";
            infoDiv.className = 'loading';

            try {
                const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
                const data = await response.json();

                if (data.status === 1) {
                    const product = data.product;
                    if (product.countries_tags && product.countries_tags.includes('en:canada')) {
                        infoDiv.innerHTML = `<p>${product.product_name} is made in Canada.</p>`;
                        infoDiv.className = 'success';
                    } else {
                        infoDiv.innerHTML = `<p>${product.product_name} is not made in Canada.</p>`;
                        infoDiv.className = 'error';

                        // Fetch Canadian alternatives
                        const alternatives = await fetchCanadianAlternatives(product.product_name);
                        infoDiv.innerHTML += `<p>Canadian alternatives: ${alternatives}</p>`;
                    }
                } else {
                    infoDiv.innerHTML = `<p>Product with barcode ${code} not found.</p>`;
                    infoDiv.className = 'error';
                }
            } catch (error) {
                console.error('Error:', error);
                infoDiv.textContent = "Error retrieving product information.";
                infoDiv.className = 'error';
            }

            Quagga.stop();
            scannerIsRunning = false;
            restartBtn.style.display = 'inline-block';
        });
    }

    startBtn.addEventListener('click', function () {
        if (!scannerIsRunning) {
            startScanner();
            startBtn.style.display = 'none';
            restartBtn.style.display = 'none';
        }
    });

    restartBtn.addEventListener('click', function () {
        if (!scannerIsRunning) {
            startScanner();
            startBtn.style.display = 'none';
            restartBtn.style.display = 'none';
        }
    });
});
