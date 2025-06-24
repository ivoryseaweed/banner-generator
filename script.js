const templateInput = document.getElementById('templateInput');
const visualsInput = document.getElementById('visualsInput');
const buttonContainer = document.querySelector('.button-container');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let templateImage = null;
let visualImages = [];
let selectedButton = null;
let bannerDataURLs = [];
let canvasWidth = 1029;
let canvasHeight = 258;

// 이미지 로드 함수 (Promise 기반)
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(e);
        img.src = src;
    });
}

// 초기화 함수
function resetState() {
    templateImage = null;
    visualImages = [];
    selectedButton = null;
    bannerDataURLs = [];
    templateInput.value = '';
    visualsInput.value = '';
    canvasWidth = 1029;
    canvasHeight = 258;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

// 배너 템플릿 및 비주얼 이미지 로드 함수
async function loadImages() {
    const templateFile = templateInput.files[0];
    const files = Array.from(visualsInput.files);

    if (!templateFile || files.length === 0) {
        alert('배너 템플릿과 비주얼 이미지를 모두 업로드해주세요.');
        return;
    }

    try {
        templateImage = await loadImage(URL.createObjectURL(templateFile));
        visualImages = await Promise.all(files.map(file => loadImage(URL.createObjectURL(file))));

        // 이미지 로딩 후 선택된 버튼에 대해 유효성 검사 및 합성 진행
        if (selectedButton) {
            processBanner(selectedButton);
        } else {
            alert('이미지 로딩 완료! px 사이즈 버튼을 누르세요');
        }
    } catch (error) {
        console.error("이미지 로딩 중 오류 발생:", error);
        alert('이미지 로딩 중 오류가 발생했습니다.');
    }
}

function removeActiveClasses() {
    document.querySelectorAll('.button-container button').forEach(btn => btn.classList.remove('active'));
}

// 이미지 사이즈 검증 함수
function validateImageSize(img, width, height) {
    const aspectRatio = width / height;
    const imgAspectRatio = img.width / img.height;

    // 정확히 일치하거나, 가로 세로 비율이 같다면 true 반환
    return (img.width === width && img.height === height) || (Math.abs(aspectRatio - imgAspectRatio) < 0.01); // 오차범위 0.01
}

// 이미지 합성 함수
function drawVisualImage(width, height, radius, mimeType, img, offsetX = 0, offsetY = 0) {
    // 캔버스 크기 설정
    canvasWidth = (width === 1200) ? 1200 : 1029;
    canvasHeight = (width === 1200) ? 600 : 258;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(templateImage, 0, 0, canvasWidth, canvasHeight);

    // 둥근 모서리 클리핑 경로 설정 및 이미지 합성
    if (radius > 0) {
        ctx.beginPath();
        ctx.moveTo(offsetX + radius, offsetY);
        ctx.lineTo(offsetX + width - radius, offsetY);
        ctx.quadraticCurveTo(offsetX + width, offsetY, offsetX + width, offsetY + radius);
        ctx.lineTo(offsetX + width, offsetY + height - radius);
        ctx.quadraticCurveTo(offsetX + width, offsetY + height, offsetX + width - radius, offsetY + height);
        ctx.lineTo(offsetX + radius, offsetY + height);
        ctx.quadraticCurveTo(offsetX, offsetY + height, offsetX, offsetY + height - radius);
        ctx.lineTo(offsetX, offsetY + radius);
        ctx.quadraticCurveTo(offsetX, offsetY, offsetX + radius, offsetY);
        ctx.closePath();
        ctx.clip();
    }
    ctx.drawImage(img, offsetX, offsetY, width, height);
    return canvas.toDataURL(mimeType, (mimeType === 'image/jpeg' ? 0.9 : 1));
}

// 배너 생성 및 다운로드 처리 함수
async function processBanner(button) {
    if (!visualImages.length || !templateImage) {
        alert('배너 템플릿과 비주얼 이미지를 모두 업로드해주세요!');
        return;
    }

    const width = parseInt(button.dataset.width);
    const height = parseInt(button.dataset.height);
    const radius = parseInt(button.dataset.radius);
    const mimeType = button.dataset.mime;
    let offsetX = 0;
    let offsetY = 0;

    // 오프셋 값 설정
    if (width === 315 && height === 186) {
        offsetX = 48;
        offsetY = 36;
    } else if (width === 232 && height === 232) {
        offsetX = 260;
        offsetY = 13;
    } else if (width === 1200 && height === 497) {
        offsetY = 193;
    }

    bannerDataURLs = []; // 초기화

    // 이미지 합성
    for (const img of visualImages) {
        if (!validateImageSize(img, width, height)) {
            alert(`업로드된 이미지 중 하나 이상의 이미지 사이즈가 선택된 버튼 사이즈와 맞지 않습니다.`);
            return;
        }
        const bannerData = drawVisualImage(width, height, radius, mimeType, img, offsetX, offsetY);
        bannerDataURLs.push(bannerData);
    }
    alert(`${button.innerText} 배너가 생성되었습니다.`);
}

// 배너 생성 버튼 클릭 이벤트
buttonContainer.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        removeActiveClasses();
        const button = event.target;
        button.classList.add('active');
        selectedButton = button;
        processBanner(button);
    }
});

// 다운로드 버튼 클릭 이벤트
downloadBtn.addEventListener('click', async () => {
    if (!selectedButton) {
        alert('px 사이즈 버튼을 먼저 눌러주세요!');
        return;
    }

    if (bannerDataURLs.length === 0) {
        alert('생성된 배너가 없습니다.');
        return;
    }

    const zip = new JSZip();
    const width = parseInt(selectedButton.dataset.width);
    const height = parseInt(selectedButton.dataset.height);
    const mimeType = selectedButton.dataset.mime;

    for (let i = 0; i < visualImages.length; i++) {
        const bannerData = bannerDataURLs[i];
        const fileName = `banner_${width}x${height}_${i + 1}.${mimeType.split('/')[1]}`;
        const base64Image = bannerData.split(',')[1];
        zip.file(fileName, base64Image, {
            base64: true
        });
    }

    try {
        const content = await zip.generateAsync({
            type: 'blob'
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'banners.zip';
        link.click();
    } catch (error) {
        console.error("ZIP 파일 생성 중 오류 발생:", error);
        alert('ZIP 파일 생성 중 오류가 발생했습니다.');
    }
});

// 초기화 버튼 클릭 이벤트
resetBtn.addEventListener('click', () => {
    removeActiveClasses();
    resetState();
    alert("초기화 되었습니다. 템플릿과 비주얼 이미지를 다시 업로드하고 px 사이즈 버튼을 누르세요");
});

// 템플릿, 비주얼 이미지 로드
templateInput.addEventListener('change', loadImages);
visualsInput.addEventListener('change', loadImages);

// 페이지 로드 시 초기화
window.onload = () => {
    resetState();
}
