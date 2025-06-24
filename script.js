const templateInput = document.getElementById('templateInput');
const visualsInput = document.getElementById('visualsInput');
const buttonContainer = document.querySelector('.button-container');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let templateImage = null;
let visualImages = []; // 다중 이미지 지원을 위해 배열로 변경
let selectedButton = null;
let bannerDataURLs = []; // 생성된 배너 데이터들을 저장할 배열
let canvasWidth = 1029;
let canvasHeight = 258;

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
    const visualFiles = Array.from(visualsInput.files);

    if (!templateFile || visualFiles.length === 0) {
        alert('배너 템플릿과 비주얼 이미지를 모두 업로드해주세요.');
        return;
    }

    try {
        templateImage = await loadImage(URL.createObjectURL(templateFile));
        visualImages = await Promise.all(visualFiles.map(file => loadImage(URL.createObjectURL(file))));
        
        alert('이미지 로딩 완료! px 사이즈 버튼을 누르세요');

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
function drawVisualImage(width, height, radius, mimeType, offsetX = 0, offsetY = 0) {
    // 캔버스 크기 설정
    canvasWidth = (width === 1200) ? 1200 : 1029;
    canvasHeight = (width === 1200) ? 600 : 258;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(templateImage, 0, 0, canvasWidth, canvasHeight);
  
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
       visualImages.forEach(visualImage => {
           ctx.drawImage(visualImage, offsetX, offsetY, width, height);
       });
    return canvas.toDataURL(mimeType, (mimeType === 'image/jpeg' ? 0.9 : 1));
}

// 배너 생성 버튼 클릭 이벤트
buttonContainer.addEventListener('click', async (event) => {
    if (event.target.tagName === 'BUTTON') {
        removeActiveClasses();
        event.target.classList.add('active');
        selectedButton = event.target;

        const width = parseInt(event.target.dataset.width);
        const height = parseInt(event.target.dataset.height);
        const radius = parseInt(event.target.dataset.radius);
        const mimeType = event.target.dataset.mime;

      // 비주얼 이미지 유효성 검사
      for (let i = 0; i < visualImages.length; i++) {
          if (visualImages[i].width !== width || visualImages[i].height !== height) {
              alert(`업로드된 이미지 중 ${i + 1}번째 이미지 사이즈가 선택된 버튼 사이즈와 다릅니다. (${width}x${height} 이미지를 업로드해주세요.)`);
              return;
          }
      }

        if (visualImages.length > 0 && templateImage) {
            if (width === 315 && height === 186) {
                bannerDataURLs = visualImages.map(img => drawVisualImage(width, height, radius, mimeType, 48, 36));
            } else if (width === 232 && height === 232) {
                bannerDataURLs = visualImages.map(img => drawVisualImage(width, height, radius, mimeType, 260, 13));
            } else if (width === 1200 && height === 497) {
                bannerDataURLs = visualImages.map(img => drawVisualImage(width, height, radius, mimeType, 0, 193));
            }
            alert(`${event.target.innerText} 배너가 생성되었습니다.`);
        } else {
            alert("템플릿과 비주얼 이미지를 모두 업로드해주세요!");
        }
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

    for (let i = 0; i < bannerDataURLs.length; i++) {
        const bannerData = bannerDataURLs[i];
        const fileName = `banner_${width}x${height}_${i + 1}.${mimeType.split('/')[1]}`;
        const base64Image = bannerData.split(',')[1];
        zip.file(fileName, base64Image, { base64: true });
    }

    try {
        const content = await zip.generateAsync({ type: 'blob' });
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
    selectedButton = null;
    bannerDataURLs = []; // 배너 데이터 URL 배열 초기화
    visualImages = [];
    templateImage = null;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    templateInput.value = '';
    visualsInput.value = '';
    canvasWidth = 1029;
    canvasHeight = 258;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    alert("초기화 되었습니다. 템플릿과 비주얼 이미지를 다시 업로드하고 px 사이즈 버튼을 누르세요");
});

// 템플릿, 비주얼 이미지 로드
templateInput.addEventListener('change', loadImages);
visualsInput.addEventListener('change', loadImages);
