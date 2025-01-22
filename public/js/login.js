document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();  // Ngăn form gửi dữ liệu theo cách truyền thống

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        fetch("http://127.0.0.1:3000/api/SignIn", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Đăng nhập thành công!');
                window.location.href = 'Admin.html';
            } else {
                alert(data.message || 'Tên đăng nhập hoặc mật khẩu không đúng.');
            }
        })
        .catch(error => {
            console.error('Lỗi khi đăng nhập:', error);
            alert('Có lỗi xảy ra khi đăng nhập.');
        });
    });
});
