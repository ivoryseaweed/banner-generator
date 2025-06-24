const templateInput = document.getElementById('templateInput');
const visualsInput = document.getElementById('visualsInput');
const buttonContainer = document.querySelector('.button-container');
const downloadBtn = document.getElementById('downloadBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let templateImage = null;
let visualImage = null;
let selectedButton = null; // 선택된 버튼 추적
let bannerDataURL = null; // 배너 데이터 URL 저장

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
function drawVisualImage() {
  if (!visualImage || !templateImage) {
    alert('배너 템플릿과 비주얼 이미지를 먼저 업로드해주세요!');
    return;
  }

  const width = parseInt(selectedButton.dataset.width);
  const height = parseInt(selectedButton.dataset.height);
  const radius = parseInt(selectedButton.dataset.radius);
  const mimeType = selectedButton.dataset.mime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(templateImage, 0, 0);

    // 둥근 모서리 클리핑 경로 설정
    if (radius > 0) {
        ctx.beginPath();
        ctx.moveTo(48 + radius, 36);
        ctx.lineTo(48 + width - radius, 36);
        ctx.quadraticCurveTo(48 + width, 36, 48 + width, 36 + radius);
        ctx.lineTo(48 + width, 36 + height - radius);
        ctx.quadraticCurveTo(48 + width, 36 + height, 48 + width - radius, 36 + height);
        ctx.lineTo(48 + radius, 36 + height);
        ctx.quadraticCurveTo(48, 36 + height, 48, 36 + height - radius);
        ctx.lineTo(48, 36 + radius);
        ctx.quadraticCurveTo(48, 36, 48 + radius, 36);
        ctx.closePath();
        ctx.clip();
    }
    // 비주얼 이미지 그리기
    ctx.drawImage(visualImage, 48, 36, width, height);

    bannerDataURL = canvas.toDataURL(mimeType); // 배너 데이터 URL 저장
}

// 이미지 사이즈 검증 함수
function validateImageSize() {
    const width = parseInt(selectedButton.dataset.width);
    const height = parseInt(selectedButton.dataset.height);

    if (visualImage.width !== width || visualImage.height !== height) {
        alert(`업로드된 이미지 사이즈가 선택된 버튼 사이즈와 다릅니다. (${width}x${height} 이미지를 업로드해주세요.)`);
        visualImage = null; // 이미지 정보 초기화
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 초기화
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
        
        if (visualImage && templateImage) {
            if (validateImageSize()) {
                drawVisualImage();
                alert(`${event.target.innerText} 배너가 생성되었습니다.`);
            }
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

// 템플릿, 비주얼 이미지 로드
templateInput.addEventListener('change', loadImages);
visualsInput.addEventListener('change', loadImages);
