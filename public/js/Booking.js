const swiper = new Swiper('.slider-wrapper', {
    loop: true,
    grabCursor: true,
    spaceBetween: true,

    // Nếu cần pagination
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true
    },

    // Các mũi tên điều hướng
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },

    breakpoints: {
        0: {
            slidesPerView: 1 // Khi màn hình nhỏ, hiển thị 1 slide
        },
        1: {
            slidesPerView: 2 // Khi màn hình vừa, hiển thị 2 slide
        },
        1024: {
            slidesPerView: 3 // Khi màn hình lớn, hiển thị 3 slide
        }
    }
});


// Lắng nghe sự kiện khi form được gửi
document.getElementById('booking-form').addEventListener('submit', async function(e) {
    e.preventDefault(); // Ngăn chặn form submit mặc định
    
    const formData = {
        customer_name: document.getElementById('name').value,
        phone_number: document.getElementById('tel').value,
        email: document.getElementById('email').value,
        number_of_people: document.getElementById('guest').value,
        booking_date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        branch: document.getElementById('branch').value,
        event_type: document.getElementById('party-type').value,
        chef_name: document.getElementById('chef').options[document.getElementById('chef').selectedIndex].text,
        notes: document.getElementById('note').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/submit-bookingdb', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Đặt bàn thành công!');
            document.getElementById('booking-form').reset();
        showSuccessModal(
            'Đặt bàn thành công! 🎉',
            `Nhà hàng sẽ gọi cho bạn để xác nhận sau nhé`
        );
        } else {
            throw new Error('Lỗi khi đặt bàn');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra khi đặt bàn. Vui lòng thử lại!');
    }
});
function showSuccessModal(title, message) {
    const modal = document.getElementById('successModal');
    if (!modal) {
        // Tạo success modal nếu chưa có
        const successModal = document.createElement('div');
        successModal.id = 'successModal';
        successModal.innerHTML = `
            <div class="modal-content">
                <h2 id="successTitle">${title}</h2>
                <p id="successMessage">${message}</p>
                <button onclick="closeSuccessModal()" class="submit-btn">Đóng</button>
            </div>
        `;
        document.body.appendChild(successModal);
    } else {
        document.getElementById('successTitle').textContent = title;
        document.getElementById('successMessage').textContent = message;
    }
    
    document.getElementById('successModal').style.display = 'flex';
}
function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
        window.location.reload(); // Làm mới trang sau khi đặt hàng thành công
    }
}