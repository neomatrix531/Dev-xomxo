// Create animated starfield
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('.starfield');
  const ctx = canvas.getContext('2d');

  // Set canvas size
  function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  setCanvasSize();
  window.addEventListener('resize', setCanvasSize);

  // Star class
  class Star {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.z = Math.random() * 2;
      this.size = Math.random() * 2;
      this.speed = Math.random() * 2 + 1;
      this.opacity = Math.random() * 0.8 + 0.2;
    }

    update() {
      this.y += this.speed;
      if (this.y > canvas.height) {
        this.reset();
        this.y = 0;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 50, 50, ${this.opacity})`;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Create stars
  const stars = Array.from({length: 200}, () => new Star());

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    stars.forEach(star => {
      star.update();
      star.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
});

