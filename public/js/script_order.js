// Lấy danh mục và hiển thị
fetch('http://localhost:3000/api/categories')
    .then(response => response.json())
    .then(categories => {
        const categoryList = document.getElementById('categoryList');
        categoryList.innerHTML = ''; // Xóa danh mục cũ trước khi hiển thị mới

        categories.forEach((category, index) => {
            const li = document.createElement('li');
            li.textContent = category.name;
            li.dataset.id = category.id;

            // Nếu là danh mục đầu tiên, mặc định chọn
            if (index === 0) {
                li.classList.add('selected-category');
                loadMenu(category.id); // Hiển thị thực đơn
            }

            li.addEventListener('click', () => {
                // Đổi màu danh mục được chọn
                document.querySelectorAll('#categoryList li').forEach(item => {
                    item.classList.remove('selected-category');
                });
                li.classList.add('selected-category');

                // Tải thực đơn tương ứng
                loadMenu(category.id);

                // Cuộn đến thực đơn
                // document.getElementById('menuList').scrollIntoView({ behavior: 'smooth' });
            });

            categoryList.appendChild(li);
        });
    })
    .catch(error => console.error('Lỗi khi lấy danh mục:', error));

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

function loadMenu(categoryId) {
    fetch(`http://localhost:3000/api/menu/${categoryId}`)
        .then(response => response.json())
        .then(menuItems => {
            const menuList = document.getElementById('menuList');
            menuList.innerHTML = ''; // Xóa thực đơn cũ trước khi hiển thị mới

            menuItems.forEach(item => {
                const div = document.createElement('div');
                div.classList.add('menu-item'); // Áp dụng lớp cho món ăn
                div.id = `menu-item-${item.id}`;

                // Kiểm tra số lượng món ăn đã có trong giỏ hàng
                const cartItem = cart.find(cartItem => cartItem.id === item.id);
                const quantity = cartItem ? cartItem.quantity : 0;

                // Thêm hình ảnh và thông tin món ăn
                div.innerHTML = `
                    <img src="${item.image_url}" alt="${item.name}">
                    <div class="info">
                        <h3>${item.name}</h3>
                        <p>Giá: ${formatPrice(item.price)} VND</p>
                        <p>Nguyên liệu: ${item.ingredients}</p>
                        <div class="quantity-control">
                            ${
                                quantity > 0
                                    ? `
                                    <button onclick="updateItemQuantity('${item.id}', -1)">-</button>
                                    <span>${quantity}</span>
                                    <button onclick="updateItemQuantity('${item.id}', 1)">+</button>
                                    `
                                    : `<button class="add-btn" onclick="addToCart('${item.id}', '${item.name}', ${item.price})">Thêm món</button>`
                            }
                        </div>
                    </div>
                `;

                menuList.appendChild(div);
            });
        })
        .catch(error => console.error('Lỗi khi lấy thực đơn:', error));
}

let cart = []; // Giỏ hàng

// Hàm thêm món ăn vào giỏ hàng
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id, name, price, quantity: 1, note: '' });
    }
    updateCartDisplay();
    updateMenuItemDisplay(id); // Cập nhật giao diện menuList
}

// Hàm cập nhật số lượng món ăn
function updateItemQuantity(id, quantityChange) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += quantityChange;
        if (item.quantity <= 0) {
            cart = cart.filter(cartItem => cartItem.id !== id);
        }
    }
    updateCartDisplay();       // Cập nhật hiển thị giỏ hàng
    updateMenuItemDisplay(id); // Cập nhật hiển thị thực đơn
}


// Cập nhật giao diện từng món trong menuList
function updateMenuItemDisplay(id) {
    const cartItem = cart.find(item => item.id === id);
    const menuItemElement = document.getElementById(`menu-item-${id}`);
    if (menuItemElement) {
        const quantityControl = menuItemElement.querySelector('.quantity-control');
        
        // Nếu cartItem tồn tại, hiển thị số lượng; nếu không, chỉ hiển thị nút "Thêm món"
        if (cartItem) {
            quantityControl.innerHTML = `
                <button onclick="updateItemQuantity('${id}', -1)">-</button>
                <span>${cartItem.quantity}</span>
                <button onclick="updateItemQuantity('${id}', 1)">+</button>
            `;
        } else {
            const itemName = menuItemElement.querySelector('h3').textContent;
            const itemPrice = parseInt(menuItemElement.querySelector('p').textContent.replace(/\D+/g, ''), 10);

            quantityControl.innerHTML = `
                <button class="add-btn" onclick="addToCart('${id}', '${itemName}', ${itemPrice})">Thêm món</button>
            `;
        }
    }
}




// Hiển thị giỏ hàng 
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    let totalQuantity = 0;
    let totalPrice = 0;

    cartItems.innerHTML = '';

    cart.forEach(item => {
        if (item && item.name && item.price) {
            const div = document.createElement('div');
            div.classList.add('cart-item');
            div.innerHTML = `
                <p><strong>${item.name}</strong></p>
                <div class="quantity-control">
                    <button onclick="changeQuantity('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity('${item.id}', 1)">+</button>
                </div>
                <p>Giá: ${formatPrice(item.price)} VND</p>
                <input type="text" 
                    class="note-input" 
                    placeholder="Thêm ghi chú..." 
                    value="${item.note || ''}"
                    onchange="updateNote('${item.id}', this.value)">
                <hr>
            `;

            totalQuantity += item.quantity;
            totalPrice += item.price * item.quantity;

            cartItems.appendChild(div);
        }
    });

    // Cập nhật footer giỏ hàng với nút đặt hàng
    const cartFooter = document.querySelector('.cart-footer');
    cartFooter.innerHTML = `
        <div>
            <p>Số lượng: <span id="cartCount">${totalQuantity}</span></p>
            <p>Tổng cộng: <span id="cartTotal">${formatPrice(totalPrice)} VND</span></p>
        </div>
        <button class="order-button" onclick="proceedToCheckout()">Đặt hàng</button>
        `;
    }
    // <button class="close-cart" onclick="document.getElementById('cart').classList.add('hidden')">Đóng</button>


// Hàm thay đổi số lượng món trong giỏ hàng
function changeQuantity(id, quantityChange) {
    const item = cart.find(item => item.id === id);
    if (item) {
        const newQuantity = item.quantity + quantityChange;

        // Nếu số lượng hợp lệ, cập nhật; nếu không, xóa khỏi giỏ
        if (newQuantity > 0) {
            item.quantity = newQuantity;
        } else {
            cart = cart.filter(cartItem => cartItem.id !== id);
        }
    }
    updateCartDisplay();
    updateMenuItemDisplay(id);
}



// Hàm thêm món ăn vào giỏ hàng
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    updateCartDisplay();
    updateMenuItemDisplay(id);
}




// Bật/ Tắt giỏ hàng
const cartElement = document.getElementById('cart');
const cartIcon = document.getElementById('cartIcon');
const closeCartButton = document.getElementById('closeCart');

// Khi bấm vào icon giỏ hàng, hiển thị hoặc ẩn giỏ hàng
cartIcon.addEventListener('click', () => {
    cartElement.classList.toggle('hidden');  // Dùng toggle ể bật/ tắt giỏ hàng
});

// Thêm hàm mới để cập nhật ghi chú
function updateNote(id, note) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.note = note;
    }
}

// Thêm biến để lưu loại đơn hàng đã chọn
let selectedOrderType = '';

// Thay đổi hàm proceedToCheckout
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Vui lòng thêm món ăn vào giỏ hàng trước khi đặt hàng');
        return;
    }
    
    const modal = document.getElementById('orderTypeModal');
    modal.style.display = 'flex'; // Thay đổi từ 'block' thành 'flex'
}

// Thêm các hàm xử lý modal
function closeOrderTypeModal() {
    const modal = document.getElementById('orderTypeModal');
    modal.style.display = 'none';
    selectedOrderType = '';
    // Bỏ chọn tất cả các option
    document.querySelectorAll('.order-option').forEach(option => {
        option.classList.remove('selected');
    });
}

function selectOrderType(type) {
    selectedOrderType = type;
    // Bỏ chọn tất cả các option trước
    document.querySelectorAll('.order-option').forEach(option => {
        option.classList.remove('selected');
    });
    // Chọn option được click
    event.currentTarget.classList.add('selected');
}

// Cập nhật hàm confirmOrderType
async function confirmOrderType() {
    if (!selectedOrderType) {
        alert('Vui lòng chọn phương thức đặt hàng');
        return;
    }

    // Lưu loại đơn hàng vào localStorage
    localStorage.setItem('orderType', selectedOrderType);
    
    // Lưu giỏ hàng vào localStorage trước khi chuyển trang
    if (selectedOrderType === 'delivery') {
        localStorage.setItem('cartItems', JSON.stringify(cart));
        window.location.href = 'checkout.html';
    } else if (selectedOrderType === 'dine-in') {
        showDineInForm();
    } else if (selectedOrderType === 'takeaway') {
        showTakeawayForm();
    }
    
    closeOrderTypeModal();
}

// Hiển thị form đặt bàn
function showDineInForm() {
    const modal = document.getElementById('dineInModal');
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Đặt tại bàn</h2>
            <form id="dineInForm" onsubmit="submitDineInForm(event)">
                <div class="form-group">
                    <label for="branch-select">Chi nhánh:</label>
                    <select id="branch-select" required>
                        <option value="">Chọn chi nhánh</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="table-select">Bàn:</label>
                    <select id="table-select" required >
                        <option value="">Chọn bàn</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="customerName">Tên khách hàng:</label>
                    <input type="text" id="customerName" required>
                </div>

                <div class="form-group">
                    <label for="phoneNumber">Số điện thoại:</label>
                    <input type="tel" id="phoneNumber"  
                    pattern="0[0-9]{9}"
                    title="Vui lòng nhập số điện thoại bắt đầu bằng số 0 và đủ 10 số"
                    required
                    title="Vui lòng nhập số điện thoại hợp lệ">
                </div>

                <div class="form-group">
                    <label for="dineInNote">Ghi chú:</label>
                    <textarea id="dineInNote"></textarea>
                </div>

                <div class="form-actions">
                    <button type="submit" class="submit-btn">Xác nhận</button>
                    <button type="button" onclick="closeFormModal('dineInModal')" class="cancel-btn">Hủy</button>
                </div>
            </form>
        </div>
    `;
    
    modal.style.display = 'flex';
    loadBranches(); // Load danh sách chi nhánh sau khi hiển thị form
}


// Cập nhật hàm submitDineInForm
async function submitDineInForm(event) {
    event.preventDefault();
    
    const branchId = document.getElementById('branch-select').value;
    const tableNumber = document.getElementById('table-select').value;
    const customerName = document.getElementById('customerName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    
    if (!branchId || !tableNumber) {
        alert('Vui lòng chọn chi nhánh và bàn');
        return;
    }
    
    const order = {
        id: generateOrderId(),
        orderType: 'dine-in',
        status: 'new',
        customer_name: customerName,
        phone: phoneNumber,
        branch_id: branchId,
        table_number: tableNumber,
        items: cart,
        subtotal: calculateSubtotal(),
        total: calculateSubtotal(),
        shipping_fee: 0,
        payment_method: 'cash',
        note: document.getElementById('dineInNote').value || null
    };

    try {
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

        // Cập nhật trạng thái bàn
        await fetch(`http://localhost:3000/api/tables/${branchId}/${tableNumber}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'dining' })
        });

        closeFormModal('dineInModal');
        showSuccessModal(
            'Đặt bàn thành công! 🎉',
            `Đơn của bạn đã được gửi đến nhà bếp. Vui lòng ngồi tại bàn số ${tableNumber} và đợi trong giây lát.`
        );
        clearCart();
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!');
    }
}

// Hiển thị form mang về
function showTakeawayForm() {
    const modal = document.getElementById('takeawayModal');
    if (!modal) {
        console.error('Modal not found');
        return;
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Đặt món mang về</h2>
            <form id="takeawayForm" onsubmit="submitTakeawayForm(event)">
                <div class="form-group">
                    <label for="branch-select-takeaway">Chi nhánh:</label>
                    <select id="branch-select-takeaway" required>
                        <option value="">Chọn chi nhánh</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="customerNametakeaway">Tên khách hàng:</label>
                    <input type="text" id="customerNametakeaway" required>
                </div>

                <div class="form-group">
                    <label for="phoneNumbertakeaway">Số điện thoại:</label>
                    <input type="tel" id="phoneNumbertakeaway"  
                    pattern="0[0-9]{9}"
                    title="Vui lòng nhập số điện thoại bắt đầu bằng số 0 và đủ 10 số"
                    required
                    title="Vui lòng nhập số điện thoại hợp lệ">
                </div>

                <div class="form-group">
                    <label for="takeawayNote">Ghi chú:</label>
                    <textarea id="takeawayNote"></textarea>
                </div>

                <div class="form-actions">
                    <button type="submit" class="submit-btn">Xác nhận</button>
                    <button type="button" onclick="closeFormModal('takeawayModal')" class="cancel-btn">Hủy</button>
                </div>
            </form>
        </div>
    `;
    
    modal.style.display = 'flex';
    
    // Load danh sách chi nhánh cho form mang về
    loadBranchesForTakeaway();
}

// Thêm hàm load chi nhánh cho form mang về
async function loadBranchesForTakeaway() {
    try {
        const response = await fetch('http://localhost:3000/api/branches');
        const branches = await response.json();
        
        const branchSelect = document.getElementById('branch-select-takeaway');
        if (branchSelect) {
            branchSelect.innerHTML = '<option value="">Chọn chi nhánh</option>' +
                branches.map(branch => 
                    `<option value="${branch.branch_id}">${branch.branch_name}</option>`
                ).join('');
        }
    } catch (error) {
        console.error('Error loading branches for takeaway:', error);
    }
}

// Cập nhật hàm submitTakeawayForm
async function submitTakeawayForm(event) {
    event.preventDefault();
    
    
    const branchId = document.getElementById('branch-select-takeaway').value;
    const customerName = document.getElementById('customerNametakeaway').value.trim();
    const phoneNumber = document.getElementById('phoneNumbertakeaway').value.trim();
    
    if (!branchId) {
        alert('Vui lòng chọn chi nhánh');
        return;
    }
    
    
    const order = {
        id: generateOrderId(),
        orderType: 'takeaway',
        status: 'new',
        customer_name: customerName,
        phone: phoneNumber,
        branch_id: branchId,
        items: cart,
        subtotal: calculateSubtotal(),
        total: calculateSubtotal(),
        shipping_fee: 0,
        payment_method: 'cash',
        note: document.getElementById('takeawayNote').value || null
    };

    try {
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

        closeFormModal('takeawayModal');
        showSuccessModal(
            'Đặt món thành công! 🎉',
            `Xin chào ${customerName}, đơn hàng của bạn sẽ được chuẩn bị tại chi nhánh đã chọn. Vui lòng đến nhận trong 30 phút.`
        );
        clearCart();
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!');
    }
}

// Thêm hàm load chi nhánh
async function loadBranches() {
    try {
        const response = await fetch('http://localhost:3000/api/branches');
        const branches = await response.json();
        
        const branchSelect = document.getElementById('branch-select');
        if (branchSelect) {
            branchSelect.innerHTML = '<option value="">Chọn chi nhánh</option>' +
                branches.map(branch => 
                    `<option value="${branch.branch_id}">${branch.branch_name}</option>`
                ).join('');
                
            // Thêm event listener cho branch select
            branchSelect.addEventListener('change', function() {
                if (this.value) {
                    loadAvailableTables(this.value);
                }
            });
        }
    } catch (error) {
        console.error('Error loading branches:', error);
    }
}

// Thêm hàm load bàn
async function loadAvailableTables(branchId) {
    try {
        const response = await fetch(`http://localhost:3000/api/tables/${branchId}`);
        const tables = await response.json();
        
        const tableSelect = document.getElementById('table-select');
        if (tableSelect) {
            tableSelect.innerHTML = '<option value="">Chọn bàn</option>' +
                tables.map(table => 
                    `<option value="${table.table_number}">Bàn ${table.table_number}</option>`
                ).join('');
            tableSelect.disabled = false;
        }
    } catch (error) {
        console.error('Error loading tables:', error);
    }
}


// Hiển thị modal thành công
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

// Đóng modal thành công
function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
        window.location.reload(); // Làm mới trang sau khi đặt hàng thành công
    }
}

// Hàm tính tổng tiền
function calculateSubtotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Hàm lưu đơn hàng vào localStorage
function saveOrder(order) {
    const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
    existingOrders.push(order);
    localStorage.setItem('orders', JSON.stringify(existingOrders));
}

// Hàm tạo ID đơn hàng
function generateOrderId() {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `OD${timestamp}${random}`;
}

// Thêm event listener để xóa animation container sau khi animation kết thúc
document.addEventListener('animationend', (e) => {
    if (e.target.classList.contains('delivery-icon')) {
        e.target.parentElement.classList.remove('active');
    }
});

// Thêm hàm để xóa giỏ hàng và cập nhật giao diện
function clearCart() {
    cart = [];
    localStorage.removeItem('cartItems');
    updateCartDisplay();
    updateAllMenuItems(); // Thêm hàm này để cập nhật lại toàn bộ menu
}

// Thêm hàm để cập nhật lại toàn bộ menu
function updateAllMenuItems() {
    // Lấy danh mục đang được chọn
    const selectedCategory = document.querySelector('.selected-category');
    if (selectedCategory) {
        loadMenu(selectedCategory.dataset.id);
    }
}

// Đóng modal khi click ra ngoài
window.onclick = function(event) {
    const modal = document.getElementById('orderTypeModal');
    if (event.target == modal) {
        closeOrderTypeModal();
    }
}

// Thêm hàm load chi nhánh
// async function loadBranches() {
//     try {
//         const response = await fetch('http://localhost:3000/api/branches');
//         const branches = await response.json();
        
//         const branchSelect = document.getElementById('branch-select');
//         branchSelect.innerHTML = '<option value="">Chọn chi nhánh</option>' +
//             branches.map(branch => 
//                 `<option value="${branch.branch_id}">${branch.branch_name}</option>`
//             ).join('');
//     } catch (error) {
//         console.error('Error loading branches:', error);
//     }
// }



// Cập nhật form đặt món
document.addEventListener('DOMContentLoaded', function() {
    const orderTypeSelect = document.getElementById('order-type');
    const branchContainer = document.getElementById('branch-container');
    const tableContainer = document.getElementById('table-container');
    
    // Load danh sách chi nhánh
    loadBranches();
    
    // Xử lý khi thay đổi loại đơn hàng
    // orderTypeSelect.addEventListener('change', function() {
    //     if (this.value === 'dine-in') {
    //         branchContainer.style.display = 'block';
    //         tableContainer.style.display = 'block';
    //     } else if (this.value === 'takeaway') {
    //         branchContainer.style.display = 'block';
    //         tableContainer.style.display = 'none';
    //     } else {
    //         branchContainer.style.display = 'none';
    //         tableContainer.style.display = 'none';
    //     }
    // });
    
    // Xử lý khi thay đổi chi nhánh
    const branchSelect = document.getElementById('branch-select');
    branchSelect.addEventListener('change', function() {
        if (this.value && orderTypeSelect.value === 'dine-in') {
            loadAvailableTables(this.value);
        }
    });
    
    // Cập nhật xử lý submit form
    const orderForm = document.getElementById('dineInForm');
    orderForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const orderData = {
            order_type: orderTypeSelect.value,
            branch_id: branchSelect.value,
            table_number: document.getElementById('table-select').value,
        };
        
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            
            if (response.ok) {
                // Nếu là đơn ăn tại chỗ, cập nhật trạng thái bàn
                if (orderData.order_type === 'dine-in') {
                    await fetch(`/api/tables/${orderData.branch_id}/${orderData.table_number}/status`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ status: 'dining' })
                    });
                }
                
                // Chuyển hướng đến trang xác nhận
                window.location.href = '/order-confirmation.html';
            }
        } catch (error) {
            console.error('Error submitting order:', error);
        }
    });
});

// Thêm CSS cho form
const formStyles = document.createElement('style');
formStyles.textContent = `


    .form-actions {
        display: flex;
        justify-content: space-around;
        gap: 10px;
        margin-top: 20px;
    }

    .submit-btn,
    .cancel-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
    }

    .submit-btn {
        background: #4CAF50;
        color: white;
    }

    .cancel-btn {
        background: #f44336;
        color: white;
    }

    .submit-btn:hover,
    .cancel-btn:hover {
        opacity: 0.9;
    }
`;
document.head.appendChild(formStyles);

// Thêm hàm đóng form modal
function closeFormModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Thêm CSS cho modals
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    #dineInModal,
    #takeawayModal,
    #successModal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        // display:flex;
        // flex-direction:column;
        // justify-content: center;
        // align-items: center;
        z-index: 1000;
    }



    #successModal .modal-content {
        text-align: center;
    }

    #successModal h2 {
        color: #4CAF50;
        margin-bottom: 15px;
        padding: 5px 5px;
    }

    #successModal p {
        margin-bottom: 20px;
        padding: 5px 5px;
    }
`;
document.head.appendChild(modalStyles);

// Thêm HTML modals vào body khi trang load
document.addEventListener('DOMContentLoaded', function() {
    // Thêm modals container
    const modalsHTML = `
        <div id="dineInModal"></div>
        <div id="takeawayModal"></div>
        <div id="successModal"></div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalsHTML);
});

// Xóa event listener gây lỗi ở cuối file
// document.addEventListener('DOMContentLoaded', function() { ... });