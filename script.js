const templateInput = document.getElementById('templateInput');
const visualsInput = document.getElementById('visualsInput');
const generateBtn = document.getElementById('generateBtn');
const button1 = document.getElementById('button1');
const button2 = document.getElementById('button2');
const button3 = document.getElementById('button3');

let visualImage; // 전역 변수로 선언
let templateImage; // 전역 변수로 선언

async function generateBanners() {
  const templateFile = templateInput.files[0];
  const visualFiles = Array.from(visualsInput.files);

  if (!templateFile || visualFiles.length === 0) {
    alert('배너 템플릿과 비주얼 이미지를 모두 업로드해주세요.');
    return;
  }

  templateImage = await loadImage(URL.createObjectURL(templateFile));

  const zip = new JSZip();

  for (const visualFile of visualFiles) {
    visualImage = await loadImage(URL.createObjectURL(visualFile));
    const canvas = document.createElement('canvas');
    canvas.width = 1029;
    canvas.height = 258;
    const ctx = canvas.getContext('2d');

    // 배너 템플릿 그리기
    ctx.drawImage(templateImage, 0, 0, 1029, 258);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    zip.file(`${visualFile.name.replace(/\..+$/, '')}_banner.png`, blob);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = 'banners.zip';
  link.click();
}

function removeActiveClasses() {
  button1.classList.remove('active');
  button2.classList.remove('active');
  button3.classList.remove('active');
}

button1.addEventListener('click', () => {
  removeActiveClasses();
  button1.classList.add('active');
  drawVisualImage(ctx, visualImage, 48, 36, 315, 186, 20, 'image/png');
});

button2.addEventListener('click', () => {
  removeActiveClasses();
  button2.classList.add('active');
  drawVisualImage(ctx, visualImage, 260, 13, 232, 232, 15, 'image/png');
});

button3.addEventListener('click', () => {
  removeActiveClasses();
  button3.classList.add('active');
  drawVisualImage(ctx, visualImage, 0, 193, 1200, 497, 0, 'image/jpeg');
});

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.src = src;
  });
}

function drawVisualImage(ctx, visualImage, x, y, width, height, radius, mimeType) {
  if (!visualImage || !templateImage) {
    alert('배너 템플릿과 비주얼 이미지를 먼저 업로드해주세요!');
    return;
  }
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // 캔버스 초기화
  ctx.drawImage(templateImage, 0, 0); // 템플릿 다시 그리기
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

  // 비주얼 그리기 (클리핑 적용 후)
  ctx.drawImage(visualImage, x, y, width, height);
}
generateBtn.addEventListener('click', generateBanners);
