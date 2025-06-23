const templateInput = document.getElementById('templateInput');
const visualsInput = document.getElementById('visualsInput');
const generateBtn = document.getElementById('generateBtn');

generateBtn.addEventListener('click', async () => {
  const templateFile = templateInput.files[0];
  const visualFiles = Array.from(visualsInput.files);

  if (!templateFile || visualFiles.length === 0) {
    alert('배너 템플릿과 비주얼 이미지를 모두 업로드해주세요.');
    return;
  }

  const templateImage = await loadImage(URL.createObjectURL(templateFile));
  const zip = new JSZip();

  for (const visualFile of visualFiles) {
    const visualImage = await loadImage(URL.createObjectURL(visualFile));
   
    const canvas = document.createElement('canvas');
    canvas.width = 1029;
    canvas.height = 258;
    const ctx = canvas.getContext('2d');

    // 배너 템플릿 그리기
    ctx.drawImage(templateImage, 0, 0, 1029, 258);

    // 둥근 모서리 클리핑 경로 설정
    const x = 48; // 비주얼 시작 x 좌표
    const y = 36; // 비주얼 시작 y 좌표
    const width = 315; // 비주얼 가로 크기
    const height = 186; // 비주얼 세로 크기
    const radius = 20; // 둥근 모서리 반지름

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

    // 비주얼 그리기 (클리핑 적용 후)
    ctx.drawImage(visualImage, x, y, width, height);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    zip.file(`${visualFile.name.replace(/\..+$/, '')}_banner.png`, blob);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = 'banners.zip';
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
