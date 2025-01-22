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
                document.getElementById('menuList').scrollIntoView({ behavior: 'smooth' });
            });

            categoryList.appendChild(li);
        });
    })
    .catch(error => console.error('Lỗi khi lấy danh mục:', error));

// Lấy thực đơn theo danh mục
function loadMenu(categoryId) {
    fetch(`http://localhost:3000/api/menu/${categoryId}`)
        .then(response => response.json())
        .then(menuItems => {
            const menuList = document.getElementById('menuList');
            menuList.innerHTML = ''; // Xóa thực đơn cũ trước khi hiển thị mới

            menuItems.forEach(item => {
                const div = document.createElement('div');
                div.classList.add('menu-item'); // Áp dụng lớp cho món ăn

                // Thêm hình ảnh và thông tin món ăn
                div.innerHTML = `
                    <img src="${item.image_url}" alt="${item.name}">
                    <div class="info">
                        <h3>${item.name}</h3>
                        <p>Giá: ${item.price} VND</p>
                        <p>Nguyên liệu: ${item.ingredients}</p>
                        <button class="add-btn" onclick="addToCart('${item.id}', '${item.name}', ${item.price})">Thêm món</button>
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
        cart.push({ id, name, price, quantity: 1 });
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
    updateCartDisplay();
    updateMenuItemDisplay(id); // Cập nhật giao diện menuList
}

// Cập nhật giao diện từng món trong menuList
function updateMenuItemDisplay(id) {
    const cartItem = cart.find(item => item.id === id);
    const quantity = cartItem ? cartItem.quantity : 0;

    const menuItemElement = document.getElementById(`menu-item-${id}`);
    if (menuItemElement) {
        menuItemElement.innerHTML = quantity > 0
            ? `
            <button onclick="updateItemQuantity('${id}', -1)">-</button>
            <span>${quantity}</span>
            <button onclick="updateItemQuantity('${id}', 1)">+</button>
            `
            : `<button class="add-btn" onclick="addToCart('${id}', '${cartItem.name}', ${cartItem.price})">Thêm món</button>`;
    }
}

// Hiển thị giỏ hàng (đã có trong phần trước)
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    
    cartItems.innerHTML = ''; // Xóa danh sách giỏ hàng hiện tại
    
    let totalQuantity = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
            <p><strong>${item.name}</strong></p>
            <div class="quantity-control">
                <button onclick="changeQuantity('${item.id}', -1)">-</button>
                <input type="number" value="${item.quantity}" min="1" onchange="changeQuantity('${item.id}', this.value - item.quantity)">
                <button onclick="changeQuantity('${item.id}', 1)">+</button>
            </div>
            <p>Giá: ${item.price} VND</p>
      
            <hr>
        `;

        totalQuantity += item.quantity;
        totalPrice += item.price * item.quantity;

        cartItems.appendChild(div);
    });

    cartCount.textContent = totalQuantity;
    cartTotal.textContent = totalPrice + ' VND';
}

// Hàm thay đổi số lượng món trong giỏ hàng
function changeQuantity(id, quantityChange) {
    const item = cart.find(item => item.id === id);

    if (item) {
        // Nếu quantityChange là số (từ bàn phím)
        if (typeof quantityChange === 'number') {
            item.quantity += quantityChange;
        } else {
            // Nếu quantityChange là giá trị trực tiếp nhập từ bàn phím
            const newQuantity = parseInt(quantityChange, 10);
            item.quantity = isNaN(newQuantity) ? 0 : newQuantity; // Xử lý số lượng không hợp lệ
        }

        // Xóa món khỏi giỏ hàng nếu số lượng <= 0
        if (item.quantity <= 0) {
            cart = cart.filter(cartItem => cartItem.id !== id);
        }
    }

    updateCartDisplay();       // Cập nhật hiển thị giỏ hàng
    updateMenuItemDisplay(id); // Cập nhật menuList
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
}

// Bật/ Tắt giỏ hàng
const cartElement = document.getElementById('cart');
const cartIcon = document.getElementById('cartIcon');
const closeCartButton = document.getElementById('closeCart');

// Khi bấm vào icon giỏ hàng, hiển thị hoặc ẩn giỏ hàng
cartIcon.addEventListener('click', () => {
    cartElement.classList.toggle('hidden');  // Dùng toggle để bật/ tắt giỏ hàng
});

