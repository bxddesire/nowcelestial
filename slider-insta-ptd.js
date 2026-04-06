(function() {
  var sliders = document.querySelectorAll('.insta-slider-auto');

  sliders.forEach(function(slider) {
    if (slider.dataset.instaReady === 'true') return;
    slider.dataset.instaReady = 'true';

    var track = slider.querySelector('.insta-track');
    var slides = Array.from(slider.querySelectorAll('.insta-pic'));
    var dotsWrap = slider.querySelector('.insta-dots');
    var prevBtn = slider.querySelector('.insta-arrow-left');
    var nextBtn = slider.querySelector('.insta-arrow-right');
    var index = 0;
    var total = slides.length;

    if (!track || !total) return;

    function update() {
      track.style.transform = 'translateX(-' + (index * 100) + '%)';

      var dots = dotsWrap.querySelectorAll('.insta-dot');
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });

      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === total - 1;
    }

    dotsWrap.innerHTML = '';
    slides.forEach(function(_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'insta-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Aller à l\'image ' + (i + 1));
      dot.addEventListener('click', function() {
        index = i;
        update();
      });
      dotsWrap.appendChild(dot);
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        if (index > 0) {
          index -= 1;
          update();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        if (index < total - 1) {
          index += 1;
          update();
        }
      });
    }

    update();
  });
})();