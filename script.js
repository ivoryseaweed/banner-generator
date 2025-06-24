const templateInput = document.getElementById('templateInput');
const visualsInput = document.getElementById('visualsInput');
const buttonContainer = document.querySelector('.button-container');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let templateImage = null;
let visualImage = null;
let selectedButton = null; // 선택된 버튼 추적
let bannerDataURL = null; // 배너 데이터 URL 저장
let canvasWidth = 1029; // 기본 캔버스 가로 크기
let canvasHeight = 258; // 기본 캔버스 세로 크기

// 이미지 로드 함수 (Promise 기반)
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
    });
}

// 배너 템플릿 및 비주얼 이미지 로드 함수
async function loadImages() {
    const templateFile = templateInput.files[0];
    const visualFile = visualsInput.files[0];

    if (!templateFile || !visualFile) {
        alert('배너 템플릿과 비주얼 이미지를 모두 업로드해주세요.');
        return;
    }

    try {
        templateImage = await loadImage(URL.createObjectURL(templateFile));
        visualImage = await loadImage(URL.createObjectURL(visualFile));
        
        // 선택된 버튼이 있다면 이미지 사이즈 검증
        if (selectedButton) {
            validateImageSize();
        } else {
            alert('이미지 로딩 완료! px 사이즈 버튼을 누르세요');
        }

    } catch (error) {
        console.error("이미지 로딩 중 오류 발생:", error);
        alert('이미지 로딩 중 오류가 발생했습니다.');
    }
}

// 활성화된 버튼 스타일 초기화 함수
function removeActiveClasses() {
    document.querySelectorAll('.button-container button').forEach(btn => btn.classList.remove('active'));
}

// 이미지 합성 함수
function drawVisualImage(width, height, radius, mimeType, offsetY = 36) {
    if (!visualImage || !templateImage) {
        alert('배너 템플릿과 비주얼 이미지를 먼저 업로드해주세요!');
        return;
    }

    const validateResult = validateImageSize(width, height);
    if (!validateResult) {
        return; // 검증 실패 시 함수 종료
    }

    // 캔버스 크기 변경
    canvasWidth = width === 1200 ? 1200 : 1029; // 1200x497 버튼 클릭 시 캔버스 가로 크기 1200으로 변경
    canvasHeight = height === 1200 ? 600 : 258; // 캔버스 세로 크기 600으로 변경
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(templateImage, 0, 0, canvasWidth, canvasHeight);

    // 둥근 모서리 클리핑 경로 설정
    let offsetX = 48;
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

    // 비주얼 이미지 그리기 (offsetY 적용)
    if (width === 1200 && height === 497) {
        offsetY = 193;
        ctx.drawImage(visualImage, 0, offsetY, width, height);
    } else {
      ctx.drawImage(visualImage, offsetX, offsetY, width, height);
    }
    bannerDataURL = canvas.toDataURL(mimeType); // 배너 데이터 URL 저장
}

// 이미지 사이즈 검증 함수
function validateImageSize(width, height) {
    if (visualImage.width !== width || visualImage.height !== height) {
        alert(`업로드된 이미지 사이즈가 선택된 버튼 사이즈와 다릅니다. (${width}x${height} 이미지를 업로드해주세요.)`);
        visualImage = null; // 이미지 정보 초기화
        ctx.clearRect(0, 0, canvasWidth, canvasHeight); // 캔버스 초기화
        return false;
    }
    return true;
}

// 배너 생성 버튼 클릭 이벤트
buttonContainer.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        removeActiveClasses();
        event.target.classList.add('active');
        selectedButton = event.target;
        const width = parseInt(event.target.dataset.width);
        const height = parseInt(event.target.dataset.height);
        const radius = parseInt(event.target.dataset.radius);
        const mimeType = event.target.dataset.mime;

        if (visualImage && templateImage) {
            drawVisualImage(width, height, radius, mimeType);
            alert(`${event.target.innerText} 배너가 생성되었습니다.`);
        } else {
            alert("템플릿과 비주얼 이미지를 모두 업로드해주세요!");
        }
    }
});

// 다운로드 함수
function downloadBanner() {
    if (!bannerDataURL) {
        alert('배너를 먼저 생성해주세요!');
        return;
    }
    const mimeType = selectedButton ? selectedButton.dataset.mime : 'image/png';
    const fileName = selectedButton ? `banner_${selectedButton.dataset.width}x${selectedButton.dataset.height}.${mimeType.split('/')[1]}` : 'banner.png';

    const link = document.createElement('a');
    link.href = bannerDataURL;
    link.download = fileName;
    link.click();
}

// 다운로드 버튼 클릭 이벤트
downloadBtn.addEventListener('click', () => {
    if (!selectedButton) {
        alert('px 사이즈 버튼을 먼저 눌러주세요!');
        return;
    }
    if (!bannerDataURL) {
        alert('배너를 먼저 생성해주세요!');
        return;
    }
    downloadBanner();
});

// 초기화 버튼 클릭 이벤트
resetBtn.addEventListener('click', () => {
    removeActiveClasses();
    selectedButton = null;
    bannerDataURL = null;
    visualImage = null;
    templateImage = null;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    templateInput.value = '';
    visualsInput.value = '';
    canvas.width = 1029;
    canvas.height = 258;
    alert("초기화 되었습니다. 템플릿과 비주얼 이미지를 다시 업로드하고 px 사이즈 버튼을 누르세요");
});

// 템플릿, 비주얼 이미지 로드
templateInput.addEventListener('change', loadImages);
visualsInput.addEventListener('change', loadImages);
