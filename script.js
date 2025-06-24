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

    // 버튼 클릭 이벤트 처리
    buttonSelection.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            selectedSize = event.target.dataset.size;
            console.log('Selected size:', selectedSize);
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
            };
        };

        reader.readAsDataURL(file);
    });

    // 비주얼 이미지 업로드 이벤트 처리
    visualImagesInput.addEventListener('change', (event) => {
        visualImages = Array.from(event.target.files);
        console.log('Visual images loaded:', visualImages.length);
    });

    // 다운로드 버튼 클릭 이벤트 처리
    downloadButton.addEventListener('click', () => {
        if (selectedSize && templateImage && visualImages.length > 0) {
            compositeImages();
        } else {
            alert('크기, 템플릿 이미지, 비주얼 이미지를 모두 선택해주세요.');
        }
    });

    // 초기화 버튼 클릭 이벤트 처리
    resetButton.addEventListener('click', () => {
        selectedSize = null;
        templateImage = null;
        visualImages = [];
        ctx.clearRect(0, 0, bannerCanvas.width, bannerCanvas.height);
        templateImageInput.value = '';
        visualImagesInput.value = '';
        console.log('초기화되었습니다.');
    });

    // 이미지 합성 함수
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

        // 사이즈 별 캔버스 설정
        let canvasWidth, canvasHeight, paddingHorizontal, paddingVertical, borderRadius, imageFormat, maxFileSize;

        switch (selectedSize) {
            case '315x186':
                canvasWidth = 1029;
                canvasHeight = 258;
                paddingHorizontal = 48;
                paddingVertical = 36;
                borderRadius = true;
                imageFormat = 'png';
                maxFileSize = 300;
                break;
            case '232x232':
                canvasWidth = 1029;
                canvasHeight = 258;
                paddingHorizontal = 260;
                paddingVertical = 13;
                borderRadius = true;
                imageFormat = 'png';
                maxFileSize = 300;
                break;
            case '1200x497':
                canvasWidth = 1200;
                canvasHeight = 600;
                paddingHorizontal = 0;
                paddingVertical = 193;
                borderRadius = false;
                imageFormat = 'jpg';
                maxFileSize = 500;
                break;
            default:
                alert('잘못된 버튼 사이즈입니다.');
                return;
        }

        bannerCanvas.width = canvasWidth;
        bannerCanvas.height = canvasHeight;

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
                    
                    // 비주얼 이미지 위치 및 크기 계산
                    let visualX, visualY, visualWidth, visualHeight;

                    switch (selectedSize) {
                        case '315x186':
                            visualX = paddingHorizontal; // 예시 비주얼에 맞춰 x 좌표 조정
                            visualY = paddingVertical;
                            visualWidth = canvasWidth / 2 - paddingHorizontal; // 비주얼 이미지 너비 조정
                            visualHeight = canvasHeight - 2 * paddingVertical;
                            break;
                        case '232x232':
                            visualX = paddingHorizontal; // 예시 비주얼에 맞춰 x 좌표 조정
                            visualY = paddingVertical;
                            visualWidth = canvasWidth / 2 - paddingHorizontal; // 비주얼 이미지 너비 조정
                            visualHeight = canvasHeight - 2 * paddingVertical;
                            break;
                        case '1200x497':
                            visualX = 0; // 예시 비주얼에 맞춰 x 좌표 조정
                            visualY = paddingVertical;
                            visualWidth = canvasWidth / 2; // 비주얼 이미지 너비 조정
                            visualHeight = canvasHeight - 2 * paddingVertical;
                            break;
                        default:
                            alert('잘못된 버튼 사이즈입니다.');
                            return;
                    }

                    // 캔버스에 이미지 그리기
                    ctx.drawImage(templateImage, canvasWidth / 2, 0, canvasWidth / 2, canvasHeight); // 템플릿 이미지 오른쪽에 배치
                    ctx.drawImage(visualImage, visualX, visualY, visualWidth, visualHeight);

                    if (borderRadius && selectedSize !== '1200x497') {
                        applyRoundedCorners(ctx, 0, 0, canvasWidth, canvasHeight, 20); // Adjust the radius as needed
                    }

                    // 다운로드 준비
                    let dataURL;
                    if (imageFormat === 'png') {
                        dataURL = bannerCanvas.toDataURL('image/png');
                    } else {
                        dataURL = bannerCanvas.toDataURL('image/jpeg', 0.8); // Adjust quality as needed
                    }

                    // 파일 사이즈 검증 (대략적인 방법)
                    const byteSize = dataURL.length * (3/4) - (dataURL.match(/==*$/) || []).length * (3/4);
                    const fileSizeInKB = byteSize / 1024;

                    if (fileSizeInKB > maxFileSize) {
                        alert(`합성된 이미지 사이즈가 ${maxFileSize}KB를 초과합니다.`);
                        return;
                    }
                    
                    // 다운로드 링크 생성
                    const a = document.createElement('a');
                    a.href = dataURL;
                    a.download = `banner_${selectedSize}.${imageFormat}`;
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                };
            };
            reader.readAsDataURL(file);
        });
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
