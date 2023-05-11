'use strict';
{
  function showPassword(eyeEl, inputEl) {
    if (eyeEl.hasClass('fa-eye')) {
      inputEl.attr('type', 'text');
      eyeEl.removeClass('fa-eye');
      eyeEl.addClass('fa-eye-slash');
    } else if (eyeEl.hasClass('fa-eye-slash')) {
      inputEl.attr('type', 'password');
      eyeEl.addClass('fa-eye');
      eyeEl.removeClass('fa-eye-slash');
    }
  }

  const eyeEl = $('.pass-eye');
  eyeEl.click(function (e) {
    const inputEl = $('.toggle-visibility');
    showPassword(eyeEl, inputEl);
  });

  const eyeEl2 = $('.pass-eye2');
  eyeEl2.click(function (e) {
    const inputEl = $('.toggle-visibility2');
    showPassword(eyeEl2, inputEl);
  });
}
