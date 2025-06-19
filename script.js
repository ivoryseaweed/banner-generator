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

    // 비주얼 그리기 (x=48, y=36에 315x186 사이즈로)
    ctx.drawImage(visualImage, 48, 36, 315, 186);

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