window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById("organic-line");
  if (!canvas) {
    console.error("Canvas element with id 'organic-line' not found");
    return;
  }
  
  const ctx = canvas.getContext("2d");
  let animationFrameId = null;
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  resizeCanvas();
  window.addEventListener("resize", () => {
    resizeCanvas();
  });
  
  // 制御点生成
  function generatePoints() {
    return Array.from({length: 12}, (_, i) => ({
      x: (i / 11) * window.innerWidth,
      baseY: window.innerHeight / 2,
      offset: Math.random() * Math.PI * 2  // ランダムな初期位相
    }));
  }
  
  let points = generatePoints();
  
  // 描画関数（スクロール量と時間で動かす）
  function drawLine() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const time = Date.now() * 0.001; // 秒単位の時間
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    
    // 最初の点
    const firstY = points[0].baseY + Math.sin(time * 0.5 + points[0].offset + scrollY * 0.005) * 25;
    ctx.moveTo(points[0].x, firstY);
    
    // 曲線を描画
    for (let i = 1; i < points.length; i++) {
      const px = points[i].x;
      const py = points[i].baseY + Math.sin(time * 0.5 + points[i].offset + scrollY * 0.005 + i * 0.5) * 25;
      
      const prevX = points[i - 1].x;
      const prevY = points[i - 1].baseY + Math.sin(time * 0.5 + points[i - 1].offset + scrollY * 0.005 + (i - 1) * 0.5) * 25;
      
      const cpX = (prevX + px) / 2;
      const cpY = (prevY + py) / 2;
      
      ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
    }
    
    // 線のスタイル
    ctx.strokeStyle = 'rgba(232, 232, 232, 0.25)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // 次のフレームをリクエスト
    animationFrameId = requestAnimationFrame(drawLine);
  }
  
  // アニメーション開始
  drawLine();
  
  // リサイズ時に制御点を再生成
  window.addEventListener("resize", () => {
    points = generatePoints();
  });
  
  // ページ離脱時にアニメーション停止
  window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });
});
