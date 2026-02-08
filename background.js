// Handle background animation and stars
document.addEventListener('DOMContentLoaded', () => {
  const container = document.createElement('div');
  container.className = 'background-container';
  
  // Add starfield canvas
  const canvas = document.createElement('canvas');
  canvas.className = 'starfield';
  container.appendChild(canvas);
  
  // Add video background
  const video = document.createElement('video');
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.innerHTML = `
    <source src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZWE5YWZhOTBhMzhmODI0NmYyOTMyMWVjZjZmODdiYzY1YTQyZGZkZCZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/U3qYN8S0j3bpK/giphy.mp4" type="video/mp4">
  `;

  container.appendChild(video);
  document.body.insertBefore(container, document.body.firstChild);

  // Start video playback
  video.play().catch(err => {
    console.warn('Video autoplay failed:', err);
  });
});