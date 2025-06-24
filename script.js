const templateInput = document.getElementById('templateInput');
const visualsInput = document.getElementById('visualsInput');
const generateBtn = document.getElementById('generateBtn');
const buttonContainer = document.querySelector('.button-container');
const downloadBtn = document.getElementById('downloadBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let visualImage = null;
let templateImage = null;
let currentMimeType = 'image/png';
let banners = []; // 생성된 배너들을 저장할 배열

async function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
    });
}

async function generateBanners() {
    const templateFile = templateInput.files[0];
    const visualFiles = Array.from(visualsInput.files);

    if (!templateFile || visualFiles.length === 0) {
        alert('배너 템플릿과 비주얼 이미지를 모두 업로드해주세요.');
        return;
    }

    try {
        templateImage = await loadImage(URL.createObjectURL(templateFile));
        visualImage = await Promise.all(visualFiles.map(file => loadImage(URL.createObjectURL(file))));

        if (!templateImage || visualImage.length === 0) {
            alert('이미지 로딩에 실패했습니다. 다시 시도해주세요.');
            return;
        }

        banners = []; // 기존 배너 초기화
        alert('이미지 로딩 완료! 버튼을 클릭하여 배너를 생성하세요.');
    } catch (error) {
        console.error("이미지 로딩 중 오류 발생:", error);
        alert('이미지 로딩 중 오류가 발생했습니다.');
    }
}

function removeActiveClasses() {
    document.querySelectorAll('.button-container button').forEach(btn => btn.classList.remove('active'));
}
// 비동기 함수로 변경하고 Promise를 반환합니다.
function drawVisualImage(ctx, visualImage, x, y, width, height, radius, mimeType) {
    return new Promise((resolve, reject) => {
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
        // 모든 이미지를 순회하며 합성
        visualImage.forEach(img => {
            ctx.drawImage(img, x, y, width, height);
        });
        resolve(canvas.toDataURL(mimeType)); // Data URL을 resolve
    });
}
// 클릭 이벤트 핸들러를 async 함수로 변경
buttonContainer.addEventListener('click', async (event) => {
    if (event.target.tagName === 'BUTTON') {
        removeActiveClasses();
        event.target.classList.add('active');

        const width = parseInt(event.target.dataset.width);
        const height = parseInt(event.target.dataset.height);
        const radius = parseInt(event.target.dataset.radius);
        const mimeType = event.target.dataset.mime;

        try {
            const bannerDataURL = await drawVisualImage(ctx, visualImage, 48, 36, width, height, radius, mimeType);
            banners.push({
                name: `${width}x${height}.${mimeType.split('/')[1]}`,
                data: bannerDataURL
            });
            alert(`${width}x${height} 배너 생성 완료!`);
        } catch (error) {
            console.error("배너 생성 중 오류 발생:", error);
            alert('배너 생성 중 오류가 발생했습니다.');
        }
    }
});
// 다운로드 함수 수정
downloadBtn.addEventListener('click', async () => {
    if (banners.length === 0) {
        alert('생성된 배너가 없습니다.');
        return;
    }
    const zip = new JSZip();
    banners.forEach(banner => {
        const base64Image = banner.data.split(',')[1];
        zip.file(banner.name, base64Image, { base64: true });
    });
    try {
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'banners.zip';
        link.click();
        banners = []; // 다운로드 후 배너 초기화
    } catch (error) {
        console.error("ZIP 파일 생성 중 오류 발생:", error);
        alert('ZIP 파일 생성 중 오류가 발생했습니다.');
    }
});

generateBtn.addEventListener('click', generateBanners);
