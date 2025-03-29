// Load Particles.js for animated background
particlesJS.load('particles-js', 'particles.json', function() {
    console.log('Particles.js loaded!');
});

// Typing effect for the welcome text
document.addEventListener("DOMContentLoaded", function () {
    const typewriter = document.querySelector('.typewriter');
    typewriter.style.animation = 'typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite';
});

// Navigation function for redirection with sound effect
function navigate(specialization) {
    // Play a sound on click (optional)
    const clickSound = new Audio('click-sound.mp3');
    clickSound.play();

    // Redirect to the respective specialization page after a slight delay
    setTimeout(() => {
        window.location.href = `${specialization}.html`;
    }, 500);
}

