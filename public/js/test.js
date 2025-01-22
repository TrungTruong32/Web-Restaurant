// Lấy các phần tử cần thiết
const showButton = document.getElementById("showButton");
const contentDiv = document.getElementById("content");

// Lắng nghe sự kiện click trên nút
showButton.addEventListener("click", function() {
  // Thêm lớp "show" vào div để hiển thị nó với hiệu ứng
  contentDiv.classList.add("show");
});
