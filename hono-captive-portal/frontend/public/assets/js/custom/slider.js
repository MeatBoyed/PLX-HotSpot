
document.addEventListener( "DOMContentLoaded", function () {

    var swiper = new Swiper( ".latest-news-slider", {
    spaceBetween: 16,
    loop: false,
    navigation: {
      nextEl: ".latest-news-slider .page-item-next",
      prevEl: ".latest-news-slider .page-item-prev",
    },
    breakpoints: {
      280: {
        slidesPerView: 1.15,
      },
      575: {
        slidesPerView: 2.15,
      },
      992: {
        slidesPerView: 2.25,
        // spaceBetween: 20,
      },
    }
  } );


} );
