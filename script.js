const templateInput = document.getElementById('templateInput');
const visualsInput = document.getElementById('visualsInput');
const generateBtn = document.getElementById('generateBtn');
const button1 = document.getElementById('button1');
const button2 = document.getElementById('button2');
const button3 = document.getElementById('button3');
const downloadBtn = document.getElementById('downloadBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let visualImage = null;
let templateImage = null;
let currentMimeType = 'image/png';

async function generateBanners() {
    const templateFile = templateInput.files[0];
    const visualFiles = Array.from(visualsInput.files);

    if (!templateFile || visualFiles.length === 0) {
        alert('배너 템플릿과 비주얼 이미지를 모두 업로드해주세요.');
        return;
    }

    templateImage = await loadImage(URL.createObjectURL(templateFile));
    // 첫 번째 비주얼 이미지를 로드하여 visualImage에 저장
    if (visualFiles.length > 0) {
        visualImage = await loadImage(URL.createObjectURL(visualFiles[0]));
    }
}

function removeActiveClasses() {
    button1.classList.remove('active');
    button2.classList.remove('active');
    button3.classList.remove('active');
}

function drawVisualImage(x, y, width, height, radius, mimeType) {
    currentMimeType = mimeType;
    if (!visualImage || !templateImage) {
        alert('배너 템플릿과 비주얼 이미지를 먼저 업로드해주세요!');
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(templateImage, 0, 0);

    // 둥근 모서리 클리핑 경로 설정
    if (radius > 0) {
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
    // 비주얼 이미지 그리기
    ctx.drawImage(visualImage, x, y, width, height);
}
// 각 버튼 클릭 이벤트 리스너
button1.addEventListener('click', () => {
    removeActiveClasses();
    button1.classList.add('active');
    drawVisualImage(48, 36, 315, 186, 20, 'image/png');
});

button2.addEventListener('click', () => {
    removeActiveClasses();
    button2.classList.add('active');
    drawVisualImage(260, 13, 232, 232, 15, 'image/png');
});

button3.addEventListener('click', () => {
    removeActiveClasses();
    button3.classList.add('active');
    drawVisualImage(0, 193, 1200, 497, 0, 'image/jpeg');
});
// 다운로드 버튼 클릭 이벤트 리스너
downloadBtn.addEventListener('click', () => {
    if (!templateImage || !visualImage) {
        alert('배너 템플릿과 비주얼 이미지를 먼저 업로드해주세요!');
        return;
    }

    const link = document.createElement('a');
    link.href = canvas.toDataURL(currentMimeType);
    link.download = 'banner.' + (currentMimeType === 'image/jpeg' ? 'jpg' : 'png');
    link.click();
});

function loadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.src = src;
    });
}
// 템플릿, 비주얼 이미지 로드
generateBtn.addEventListener('click', generateBanners);
