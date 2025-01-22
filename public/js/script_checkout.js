// Format price with Vietnamese currency
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
}

// Thêm biến để lưu trữ dữ liệu địa chỉ
let provinces = [];
let districts = [];
let wards = [];

// Thêm hằng số cho phí vận chuyển
const SHIPPING_FEE_HCMC = 0;
const SHIPPING_FEE_OTHER = 30000;

// Hàm tính tổng tiền bao gồm phí ship
function calculateTotal(subtotal, provinceCode) {
    const shippingFee = provinceCode === '79' ? SHIPPING_FEE_HCMC : SHIPPING_FEE_OTHER; // 79 là mã TP.HCM
    return {
        subtotal: subtotal,
        shippingFee: shippingFee,
        total: subtotal + shippingFee
    };
}
// function showOrder(){
//     const modal = document.getElementById('orderForm');
//     modal.innerHTML  = `
//     <div class="form-group">
//         <label for="name">Họ và tên *</label>
//         <input type="text" id="name" required>
//     </div>

//     <div class="form-group">                    
//         <label for="phone">Số điện thoại *</label>
//         <input type="tel" id="phone"  
//         pattern="0[0-9]{9}"
//         title="Vui lòng nhập số điện thoại bắt đầu bằng số 0 và đủ 10 số"
//         required
//         title="Vui lòng nhập số điện thoại hợp lệ">
//     </div>

//     <div class="form-group">
//         <label for="province">Tỉnh/Thành phố *</label>
//         <select id="province" required>
//             <option value="">Chọn Tỉnh/Thành phố</option>
//         </select>
//     </div>

//     <div class="form-group">
//         <label for="district">Quận/Huyện *</label>
//         <select id="district" required disabled>
//             <option value="">Chọn Quận/Huyện</option>
//         </select>
//     </div>

//     <div class="form-group">
//         <label for="ward">Phường/Xã *</label>
//         <select id="ward" required disabled>
//             <option value="">Chọn Phường/Xã</option>
//         </select>
//     </div>

//     <div class="form-group">
//         <label for="specificAddress">Địa chỉ cụ thể *</label>
//         <textarea id="specificAddress" placeholder="Số nhà, tên đường..." required></textarea>
//     </div>

//     <div class="form-group">
//         <label for="payment_method">Phương thức thanh toán *</label>
//         <select id="payment_method" required>
//             <option value="cod">Thanh toán khi nhận hàng</option>
//             <option value="banking">Chuyển khoản ngân hàng</option>
//             <option value="momo">Ví MoMo</option>
//         </select>
//     </div>
//     <!-- Thêm div này để hiển thị thông tin thanh toán -->
//     <div id="payment-info" style="display: none;"></div>

//     <div class="form-group">
//         <label for="note">Ghi chú thêm</label>
//         <textarea id="note"></textarea>
//     </div>
// `;
// }

// Cập nhật hàm hiển thị tổng tiền
function updateTotalDisplay(provinceCode) {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    let subtotal = 0;

    cartItems.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    const { subtotal: sub, shippingFee, total } = calculateTotal(subtotal, provinceCode);

    // Cập nhật hiển thị
    document.getElementById('subtotal').textContent = formatPrice(sub);
    document.getElementById('shippingFee').textContent = formatPrice(shippingFee);
    document.getElementById('totalAmount').textContent = formatPrice(total);
}

// Hàm load cart items và tính toán tổng tiền
function loadCartItems() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const cartItemsContainer = document.getElementById('cartItems');
    let subtotal = 0;
    
    cartItemsContainer.innerHTML = '';

    cartItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        itemDiv.innerHTML = `
            <div>
                <strong>${item.name}</strong> x ${item.quantity}
                ${item.note ? `<br><small>Ghi chú: ${item.note}</small>` : ''}
            </div>
            <div>${formatPrice(itemTotal)}</div>
        `;
        cartItemsContainer.appendChild(itemDiv);
    });

    // Hiển thị tổng tiền ban đầu (chưa có phí ship)
    updateTotalDisplay('');
}

// Load địa chỉ khi trang được load
document.addEventListener('DOMContentLoaded', function() {
    // Load giỏ hàng
    loadCartItems();
    
    // Load dữ liệu tỉnh/thành phố
    fetch('https://provinces.open-api.vn/api/p/')
        .then(response => response.json())
        .then(data => {
            provinces = data;
            const provinceSelect = document.getElementById('province');
            provinceSelect.innerHTML = '<option value="">Chọn Tỉnh/Thành phố</option>';
            provinces.forEach(province => {
                provinceSelect.add(new Option(province.name, province.code));
            });
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu tỉnh/thành phố:', error);
            alert('Không thể tải dữ liệu địa chỉ. Vui lòng thử lại sau.');
        });
});

// Xử lý khi chọn tỉnh/thành phố
document.getElementById('province').addEventListener('change', function() {
    const provinceCode = this.value;
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');
    
    // Reset quận/huyện và phường/xã
    districtSelect.innerHTML = '<option value="">Chọn Quận/Huyện</option>';
    wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';
    
    // Cập nhật tổng tiền khi thay đổi tỉnh/thành phố
    updateTotalDisplay(provinceCode);
    
    if (provinceCode) {
        districtSelect.disabled = false;
        fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
            .then(response => response.json())
            .then(data => {
                districts = data.districts;
                districts.forEach(district => {
                    districtSelect.add(new Option(district.name, district.code));
                });
            })
            .catch(error => {
                console.error('Lỗi khi tải dữ liệu quận/huyện:', error);
                alert('Không thể tải dữ liệu quận/huyện. Vui lòng thử lại sau.');
            });
    } else {
        districtSelect.disabled = true;
        wardSelect.disabled = true;
    }
});

// Xử lý khi chọn quận/huyện
document.getElementById('district').addEventListener('change', function() {
    const districtCode = this.value;
    const wardSelect = document.getElementById('ward');
    
    // Reset phường/xã
    wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';
    
    if (districtCode) {
        wardSelect.disabled = false;
        fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
            .then(response => response.json())
            .then(data => {
                wards = data.wards;
                wards.forEach(ward => {
                    wardSelect.add(new Option(ward.name, ward.code));
                });
            })
            .catch(error => {
                console.error('Lỗi khi tải dữ liệu phường/xã:', error);
                alert('Không thể tải dữ liệu phường/xã. Vui lòng thử lại sau.');
            });
    } else {
        wardSelect.disabled = true;
    }
});


// Handle order submission
async function submitOrder(event) {
    event.preventDefault();

    // Lấy thông tin form
    const formData = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        province: document.getElementById('province'),
        district: document.getElementById('district'),
        ward: document.getElementById('ward'),
        specificAddress: document.getElementById('specificAddress').value.trim(),
        payment_method: document.getElementById('payment_method').value,
        note: document.getElementById('note').value.trim(),
        items: JSON.parse(localStorage.getItem('cartItems')) || []
    };

    // Validate form
    if (!formData.name || !formData.phone || !formData.province.value || 
        !formData.district.value || !formData.ward.value || !formData.specificAddress) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
    }

    // Tạo địa chỉ đầy đủ
    const fullAddress = `${formData.specificAddress}, ${formData.ward.selectedOptions[0].text}, ${formData.district.selectedOptions[0].text}, ${formData.province.selectedOptions[0].text}`;

    // Tính tổng tiền
    let subtotal = 0;
    formData.items.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    // Tính phí ship
    const shippingFee = formData.province.value === '79' ? 0 : 30000;

    // Tạo đối tượng đơn hàng
    const order = {
        id: generateOrderId(),
        orderType: 'delivery',
        status: 'new',
        customer_name: formData.name,
        phone: formData.phone,
        address: fullAddress,
        items: formData.items,
        subtotal: subtotal,
        shipping_fee: shippingFee,
        total: subtotal + shippingFee,
        payment_method: formData.payment_method,
        note: formData.note
    };

    try {
        // Gửi đơn hàng lên server
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(order)
        });

        if (!response.ok) {
            throw new Error('Lỗi khi gửi đơn hàng');
        }

        // Xóa giỏ hàng
        localStorage.removeItem('cartItems');
        localStorage.removeItem('orderType');

        // Thông báo thành công và chuyển về trang chủ
        alert('Đặt hàng thành công! Cảm ơn bạn đã đặt hàng.');
        window.location.href = 'introduction.html';

    } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.');
    }
}

// Hàm tạo ID ngẫu nhiên
function generateOrderId() {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `OD${timestamp}${random}`;
} 
// Thêm event listener cho select payment_method
document.getElementById('payment_method').addEventListener('change', function() {
    const paymentInfo = document.getElementById('payment-info');
    
    if (this.value === 'banking') {
        paymentInfo.innerHTML = `
            <div class="payment-details">
                <h3>Thông tin chuyển khoản</h3>
                <p>Ngân hàng: Vietcombank</p>
                <p>Số tài khoản: 1234567890</p>
                <p>Chủ tài khoản: NHÀ HÀNG MIỀN TÂY</p>
                <p>Nội dung: [Số điện thoại] thanh toán</p>
            </div>
        `;
        paymentInfo.style.display = 'block';
    } 
    else if (this.value === 'momo') {
        paymentInfo.innerHTML = `
            <div class="payment-details">
                <h3>Thông tin Momo</h3>
                <p>Số điện thoại: 0987654321</p>
                <p>Tên: NHÀ HÀNG MIỀN TÂY</p>
                <p>Nội dung: [Số điện thoại] thanh toán</p>
            </div>
        `;
        paymentInfo.style.display = 'block';
    }
    else {
        paymentInfo.style.display = 'none';
    }
});
// showOrder()