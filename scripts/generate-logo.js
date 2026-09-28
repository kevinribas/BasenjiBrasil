const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processLogo() {
  const inputPath = path.join(__dirname, '../public/images/logo.jfif');
  console.log('Carregando imagem original:', inputPath);

  const img = sharp(inputPath);
  const metadata = await img.metadata();
  console.log(`Dimensões originais: ${metadata.width}x${metadata.height}`);

  // 1. Cobrir a região do texto "BASENJI BRASIL" (abaixo das patinhas, a partir de y = 1113)
  // Amostra de cor no ponto exato da separação (1408, 1120): [254, 254, 252]
  // Criamos um SVG overlay cobrindo de Y=1114 até a base da imagem
  const maskHeight = metadata.height - 1114;
  const maskSvg = Buffer.from(`
    <svg width="${metadata.width}" height="${metadata.height}">
      <rect x="0" y="1114" width="${metadata.width}" height="${maskHeight}" fill="#fdfdfb" />
    </svg>
  `);

  const maskedImageBuffer = await img
    .composite([{ input: maskSvg, top: 0, left: 0 }])
    .toBuffer();

  // 2. Recortar a ilustração perfeitamente centralizada em 1024x1024
  // Limites da ilustração: X=[947..1868] (largura 921), Y=[215..1109] (altura 894)
  // Centro: X=1408, Y=662
  // Com 1024x1024: left = 896, top = 150
  const cropLeft = 896;
  const cropTop = 150;
  const cropSize = 1024;

  const croppedMaster = await sharp(maskedImageBuffer)
    .extract({ left: cropLeft, top: cropTop, width: cropSize, height: cropSize })
    .png({ quality: 100 })
    .toBuffer();

  // Salvar a nova logo oficial sem texto em alta resolução
  const logoPngPath = path.join(__dirname, '../public/images/logo.png');
  await sharp(croppedMaster).png().toFile(logoPngPath);
  console.log('✓ Salvo public/images/logo.png (1024x1024)');

  // 3. Gerar ícones para o app Next.js e PWA / Mobile
  // app/icon.png (512x512)
  const appIconPath = path.join(__dirname, '../app/icon.png');
  await sharp(croppedMaster).resize(512, 512).png().toFile(appIconPath);
  console.log('✓ Salvo app/icon.png (512x512)');

  // app/apple-icon.png e public/apple-icon.png (180x180)
  const appleIconAppPath = path.join(__dirname, '../app/apple-icon.png');
  await sharp(croppedMaster).resize(180, 180).png().toFile(appleIconAppPath);
  console.log('✓ Salvo app/apple-icon.png (180x180)');

  const appleIconPublicPath = path.join(__dirname, '../public/apple-icon.png');
  await sharp(croppedMaster).resize(180, 180).png().toFile(appleIconPublicPath);
  console.log('✓ Salvo public/apple-icon.png (180x180)');

  // 4. Gerar favicon.ico em app/ e public/
  // Favicon padrão para compatibilidade máxima (48x48 PNG renomeado como ico é suportado por navegadores modernos, ou 32x32)
  const faviconAppPath = path.join(__dirname, '../app/favicon.ico');
  await sharp(croppedMaster).resize(48, 48).png().toFile(faviconAppPath);
  console.log('✓ Salvo app/favicon.ico (48x48)');

  const faviconPublicPath = path.join(__dirname, '../public/favicon.ico');
  await sharp(croppedMaster).resize(48, 48).png().toFile(faviconPublicPath);
  console.log('✓ Salvo public/favicon.ico (48x48)');

  console.log('Todos os assets do logotipo e favicons foram gerados com sucesso!');
}

processLogo().catch(err => {
  console.error('Erro ao processar logotipo:', err);
  process.exit(1);
});
