document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 가져오기
    const buttonSelection = document.querySelector('.button-selection');
    const templateImageInput = document.getElementById('template-image');
    const visualImagesInput = document.getElementById('visual-images');
    const bannerCanvas = document.getElementById('banner-canvas');
    const downloadButton = document.getElementById('download-button');
    const resetButton = document.getElementById('reset-button');
    const ctx = bannerCanvas.getContext('2d');

    // 변수 초기화
    let selectedSize = null;
    let templateImage = null;
    let visualImages = [];
    let currentButton = null; // 현재 클릭된 버튼 추적

    // 버튼 클릭 이벤트 처리
    buttonSelection.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const button = event.target;

            // 이전에 클릭된 버튼이 있다면 active 클래스 제거
            if (currentButton) {
                currentButton.classList.remove('active');
            }

            // 현재 클릭된 버튼에 active 클래스 추가
            button.classList.add('active');
            currentButton = button;

            selectedSize = button.dataset.size;
            console.log('Selected size:', selectedSize);

            // 선택된 사이즈에 따라 캔버스 크기 조정
            adjustCanvasSize(selectedSize);

            // 캔버스 표시
            bannerCanvas.style.display = 'block';
        }
    });

    // 템플릿 이미지 업로드 이벤트 처리
    templateImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            templateImage = new Image();
            templateImage.src = e.target.result;
            templateImage.onload = () => {
                console.log('Template image loaded');
                // 템플릿 이미지가 로드되면 합성 시작
                if (visualImages.length > 0) {
                    compositeImages();
                }
            };
        };

        reader.readAsDataURL(file);
    });

    // 비주얼 이미지 업로드 이벤트 처리
    visualImagesInput.addEventListener('change', (event) => {
        visualImages = Array.from(event.target.files);
        console.log('Visual images loaded:', visualImages.length);
        // 비주얼 이미지가 로드되면 합성 시작
        if (templateImage) {
            compositeImages();
        }
    });

    // 다운로드 버튼 클릭 이벤트 처리
    downloadButton.addEventListener('click', () => {
        if (selectedSize && templateImage && visualImages.length > 0) {
            compositeImages();
            downloadImage(); // 다운로드 함수 호출
        } else {
            alert('크기, 템플릿 이미지, 비주얼 이미지를 모두 선택해주세요.');
        }
    });

    // 초기화 버튼 클릭 이벤트 처리
    resetButton.addEventListener('click', () => {
        selectedSize = null;
        templateImage = null;
        visualImages = [];

        // active 클래스 제거
        if (currentButton) {
            currentButton.classList.remove('active');
            currentButton = null;
        }

        ctx.clearRect(0, 0, bannerCanvas.width, bannerCanvas.height);
        templateImageInput.value = '';
        visualImagesInput.value = '';
        bannerCanvas.style.display = 'none'; // 초기화 시 캔버스 숨김
        console.log('초기화되었습니다.');
    });

    // 캔버스 크기 조정 함수
    function adjustCanvasSize(size) {
        let canvasWidth, canvasHeight;

        switch (size) {
            case '315x186':
                canvasWidth = 1029;
                canvasHeight = 258;
                break;
            case '232x232':
                canvasWidth = 1029;
                canvasHeight = 258;
                break;
            case '1200x497':
                canvasWidth = 1200;
                canvasHeight = 600;
                break;
            default:
                alert('잘못된 버튼 사이즈입니다.');
                return;
        }

        bannerCanvas.width = canvasWidth;
        bannerCanvas.height = canvasHeight;
    }

    // 이미지 생성 함수
    function compositeImages() {
        if (!selectedSize) {
            alert('버튼 사이즈를 선택해주세요.');
            return;
        }

        if (!templateImage) {
            alert('템플릿 이미지를 업로드해주세요.');
            return;
        }

        if (visualImages.length === 0) {
            alert('비주얼 이미지를 업로드해주세요.');
            return;
        }

        // 사이즈 별 캔버스 설정 (adjustCanvasSize 함수에서 처리)
        const canvasWidth = bannerCanvas.width;
        const canvasHeight = bannerCanvas.height;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight); // 캔버스 초기화

        // 사이즈 별 패딩 값 설정
        let paddingHorizontal, paddingVertical, borderRadius;
        switch (selectedSize) {
            case '315x186':
                paddingHorizontal = 48;
                paddingVertical = 36;
                borderRadius = true;
                break;
            case '232x232':
                paddingHorizontal = 260;
                paddingVertical = 13;
                borderRadius = true;
                break;
            case '1200x497':
                paddingHorizontal = 0;
                paddingVertical = 193;
                borderRadius = false;
                break;
        }

        // 이미지 합성 로직
        visualImages.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const visualImage = new Image();
                visualImage.src = e.target.result;
                visualImage.onload = () => {
                    // 이미지 사이즈 검증
                    const [width, height] = selectedSize.split('x').map(Number);
                    const ratio = width / height;
                    const visualRatio = visualImage.width / visualImage.height;

                    if (Math.abs(ratio - visualRatio) > 0.01) {
                        alert(`업로드된 이미지 ${file.name}의 비율이 ${selectedSize} 사이즈와 맞지 않습니다.`);
                        return;
                    }

                    // 캔버스에 이미지 그리기
                    // 먼저 템플릿 이미지를 그립니다.
                    ctx.drawImage(templateImage, 0, 0, canvasWidth, canvasHeight);

                    // 비주얼 이미지를 템플릿 이미지 위에 그립니다.
                    let visualX = paddingHorizontal;
                    let visualY = paddingVertical;
                    let visualWidth = canvasWidth - 2 * paddingHorizontal;
                    let visualHeight = canvasHeight - 2 * paddingVertical;

                     // 1200x497 사이즈의 경우 비주얼 이미지를 오른쪽 절반에 맞춥니다.
                    if (selectedSize === '1200x497') {
                        visualX = canvasWidth / 2;
                        visualY = paddingVertical;
                        visualWidth = canvasWidth / 2 - 2 * paddingHorizontal;
                        visualHeight = canvasHeight - 2 * paddingVertical;
                    }

                    // 비주얼 이미지를 그립니다.
                    ctx.drawImage(visualImage, visualX, visualY, visualWidth, visualHeight);

                    if (borderRadius) {
                        applyRoundedCorners(ctx, 0, 0, canvasWidth, canvasHeight, 20);
                    }
                };
            };
            reader.readAsDataURL(file);
        });
    }

    function downloadImage() {
        // 다운로드 준비
        let dataURL;
        let imageFormat = 'png'; // 기본적으로 PNG 포맷 사용
        if (selectedSize === '1200x497') {
            imageFormat = 'jpeg'; // 1200x497 사이즈는 JPEG 포맷 사용
        }

        if (imageFormat === 'png') {
            dataURL = bannerCanvas.toDataURL('image/png');
        } else {
            dataURL = bannerCanvas.toDataURL('image/jpeg', 0.8); // JPEG 품질 설정
        }

        // 다운로드 링크 생성
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = `banner_${selectedSize}.${imageFormat}`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // 캔버스에 둥근 모서리 적용 함수
    function applyRoundedCorners(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.clip();
    }
});
