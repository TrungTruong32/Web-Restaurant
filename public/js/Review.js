// Khi người dùng nhấn nút "Gửi Đánh Giá"
async function submitReview() {
    const stars = document.querySelectorAll(".star.selected").length;
    const comment = document.getElementById("comment").value.trim();
    
    // Kiểm tra sao và comment trước
    if (!stars || !comment) {
        alert("Vui lòng chọn số sao và nhập nội dung đánh giá!");
        return;
    }

    let phone_number;
    let isValidPhone = false;
    
    while (!isValidPhone) {
        phone_number = prompt("Vui lòng nhập số điện thoại của bạn:").trim();
        
        // Kiểm tra nếu người dùng nhấn Cancel
        if (phone_number === null) {
            return;
        }

        // Validate số điện thoại
        if (validatePhone(phone_number)) {
            isValidPhone = true;
        } else {
            alert("Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại bắt đầu bằng 0 hoặc 84, theo sau bởi 9 chữ số.");
        }
    }

    // Gửi đánh giá khi đã có số điện thoại hợp lệ
    const response = await fetch("http://localhost:3000/api/submit-reviews", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone_number, stars, comment }),
    });

    if (response.ok) {
        alert("Cảm ơn bạn đã gửi đánh giá!");
        loadReviews();
        document.getElementById("comment").value = "";
        document.querySelectorAll(".star").forEach((star) => star.classList.remove("selected"));
    } else {
        alert("Có lỗi xảy ra, vui lòng thử lại sau!");
    }
}

// Hàm validate số điện thoại
function validatePhone(phone) {
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    return phoneRegex.test(phone);
}

// Xử lý click vào các ngôi sao để chọn mức đánh giá
document.querySelectorAll(".star").forEach((star) => {
    star.addEventListener("click", () => {
        const value = parseInt(star.getAttribute("data-value"), 10);
        document.querySelectorAll(".star").forEach((s) => s.classList.remove("selected"));
        for (let i = 0; i < value; i++) {
            document.querySelectorAll(".star")[i].classList.add("selected");
        }
    });
});

// Hàm tải các đánh giá từ server
async function loadReviews() {
    const response = await fetch("http://localhost:3000/api/page-get-reviews?hide_phone=true");
    if (response.ok) {
        const reviews = await response.json();
        const reviewsList = document.getElementById("reviews-list");
        reviewsList.innerHTML = reviews
            .map(
                (r) =>
                    `<div class="review-item">
                        <h3>${r.stars} sao - ${r.phone_number}</h3> 
                        <p>${r.comment}</p>
                        <small>${new Date(r.created_at).toLocaleString()}</small>
                    </div>`
            )
            .join("");
    } else {
        alert("Không thể tải đánh giá!");
    }
}

// Tải danh sách đánh giá khi trang được tải
document.addEventListener("DOMContentLoaded", loadReviews);
