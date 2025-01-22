const swiper = new Swiper('.slider-wrapper', {
    loop: true,
    grabCursor: true,
    spaceBetween:true,

      // If we need pagination
    pagination: {
        el: '.swiper-pagination',
        clickable:true,
        dynamicBullets:true
    },
  
    // Navigation arrows
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  
    breakpoints:{
        0: {
            slidesPerView:1
        },
        1:{
            slidesPerView:2
        },
        1024:{
            slidesPerView3
        }
    }

  });



  const takeActionOrderCon = document.getElementById("take-action-order-con");
  const bookingPage = document.getElementById("booking-page");
  
  // Lắng nghe sự kiện click của nút
  takeActionOrderCon.addEventListener("click", function() {
    // Thêm lớp 'show' vào div để kích hoạt hiệu ứng trượt
    bookingPage.classList.add("loaded");
  
    // Hiển thị div sau khi hiệu ứng được kích hoạt (thay đổi display)
    bookingPage.classList.remove("hidden");
  });


  // --------------------------------------------------footer-map

  const locations = [
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.616352994351!2d106.6786956740531!3d10.76402183938399!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f1c06f4e1dd%3A0x43900f1d4539a3d!2sUniversity%20of%20Science%20-%20VNUHCM!5e0!3m2!1sen!2s!4v1735370578284!5m2!1sen!2s",
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.474214988337!2d106.65505527405335!3d10.774945489373728!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752ec14c5d6c91%3A0xff88fc876f84e14!2zS2hvYSBL4bu5IHRodeG6rXQgR2lhbyB0aMO0bmcgLSBDNSwgMjY4IEzDvSBUaMaw4budbmcgS2nhu4d0LCBQaMaw4budbmcgMTQsIFF14bqtbiAxMCwgSOG7kyBDaMOtIE1pbmgsIFZpZXRuYW0!5e0!3m2!1sen!2s!4v1735370659325!5m2!1sen!2s",
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.5009942435404!2d106.74109417405467!3d10.849447889303796!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527c1077c41c1%3A0xdd465995602dcf1a!2zMTIzIFZp4buHdCBOYW0!5e0!3m2!1sen!2s!4v1735370732809!5m2!1sen!2s",
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.5364973150668!2d106.70133257405325!3d10.770160289378216!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f410949084f%3A0x46273b4e0df7e33f!2zMzYgVMO0biBUaOG6pXQgxJDhuqFtLCBQaMaw4budbmcgTmd1eeG7hW4gVGjDoWkgQsOsbmgsIFF14bqtbiAxLCBI4buTIENow60gTWluaCwgVmlldG5hbQ!5e0!3m2!1sen!2s!4v1735370785374!5m2!1sen!2s"  

  ]
  var btnSrc = document.getElementsByClassName("address");
  
  for (let i = 0; i < btnSrc.length; i++) {
      btnSrc[i].addEventListener('click', function() {
      document.getElementsByClassName("mapFrame")[0].src = locations[i];
      document.getElementById("demo").innerHTML = locations[i];
      
    })
  }


  ////////////////////xử lý cho thẻ đánh giá
  document.getElementById("review-link").addEventListener("click", function(event) {
    event.preventDefault();
    window.location.href = "Review.html";
});
