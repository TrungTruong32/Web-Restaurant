document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll(".main-content section");
    const sidebarLinks = document.querySelectorAll(".sidebar ul li a");


    if (sections.length === 0 || sidebarLinks.length === 0) {
        console.error("Các phần tử cần thiết không tồn tại trong DOM!");
        return;
    }

    function showSection(targetId) {
        sections.forEach(section => {
            section.style.display = section.id === targetId ? "block" : "none";
        });
    }

    sidebarLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            console.log('Clicked link:', this.getAttribute("href")); // Debug log
            
            // Remove active class from all links
            sidebarLinks.forEach(link => link.classList.remove("active"));
            this.classList.add("active");
            const targetId = this.getAttribute("href").substring(1);
            console.log('Target section:', targetId); // Debug log
            
            // Show correct section
            const sections = document.querySelectorAll(".main-content section");
            sections.forEach(section => {
                section.style.display = section.id === targetId ? "block" : "none";
            });
            
            // If menu section is shown, load menu items
            if (targetId === 'menu') {
                console.log('Loading menu items...'); // Debug log
                loadMenuItems();
            }
        });
    });


/*******************************************STAFF**********************************************/
// function loadStaffData() {
//     fetch("http://127.0.0.1:3000/api/get-staff")
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 const staffList = data.data;
//                 const staffTable = document.getElementById("staff-list");
//                 staffTable.innerHTML = '';  // Clear the table first

//                 // Loop qua danh sách nhân viên và thêm vào bảng
//                 staffList.forEach(staff => {
//                     const row = document.createElement('tr');
//                     row.innerHTML = `
//                         <td>${staff.name}</td>
//                         <td>${staff.username}</td>
//                         <td>${staff.password}</td> <!-- Hiển thị mật khẩu -->
//                         <td>
//                             <button onclick="removeStaff('${staff.username}')">Xóa</button>
//                         </td>
//                     `;
//                     staffTable.appendChild(row);
//                 });
//             } else {
//                 alert("Không thể tải dữ liệu nhân viên.");
//             }
//         })
//         .catch(error => {
//             console.error('Lỗi khi tải danh sách nhân viên:', error);
//             alert("Có lỗi khi tải danh sách nhân viên.");
//         });
// }

// // Gọi hàm loadStaffData khi trang được tải
// loadStaffData();

// document.getElementById("add-staff-btn").addEventListener("click", function () {
//     const name = document.getElementById("staff-name").value;
//     const username = document.getElementById("staff-username").value;
//     const password = document.getElementById("staff-password").value;

//     if (!name || !username || !password) {
//         alert("Vui lòng nhập đầy đủ thông tin.");
//         return;
//     }

//     fetch("http://127.0.0.1:3000/api/submit-staff", {  // Đảm bảo URL đúng và port 3000
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name, username, password }),
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         return response.json();
//     })
//     .then(data => {
//         if (data.success) {
//             alert("Thêm nhân viên thành công!");
//             loadStaffData();  // Tải lại danh sách nhân viên sau khi thêm
//         } else {
//             alert("Có lỗi khi thêm nhân viên.");
//         }
//     })
//     .catch(error => {
//         console.error('Chi tiết lỗi:', error);
//         alert("Đã xảy ra lỗi kết nối hoặc dữ liệu không hợp lệ.");
//     });
// });

// window.removeStaff = function (username) {
//     fetch(`http://127.0.0.1:3000/api/removestaff/${username}`, { method: "DELETE" })
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 alert("Xóa nhân viên thành công!");
//                 loadStaffData();  // Tải lại danh sách nhân viên sau khi xóa
//             } else {
//                 alert("Có lỗi khi xóa nhân viên.");
//             }
//         });
// };

/*******************************************BOOKING**********************************************/

function loadBookings() {
    fetch("http://localhost:3000/api/get-bookingdb")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("reserve");
            tableBody.innerHTML = "";

            data.forEach(async function(booking) {
                const row = tableBody.insertRow();
                
                // Thêm các cell thông tin cơ bản
                row.insertCell(0).textContent = booking.customer_name;
                row.insertCell(1).textContent = booking.phone_number;
                row.insertCell(2).textContent = booking.email;
                row.insertCell(3).textContent = booking.number_of_people;
                row.insertCell(4).textContent = new Date(booking.booking_date).toLocaleDateString();
                row.insertCell(5).textContent = booking.time;
                row.insertCell(6).textContent = booking.branch;
                row.insertCell(7).textContent = booking.event_type;
                row.insertCell(8).textContent = booking.chef_name;
                row.insertCell(9).textContent = booking.notes;

                const statusCell = row.insertCell(10);
                const reasonCell = row.insertCell(11);
                const tableNumberCell = row.insertCell(12);
                // const actionCell = row.insertCell(13); // Thêm cột mới cho actions

                // Tạo dropdown cho trạng thái
                const statusSelect = document.createElement('select');
                statusSelect.className = 'status-select';
                const statuses = ['Chưa xử lý', 'Nhận đơn', 'Từ chối', 'Đã xử lý'];
                
                statuses.forEach(stat => {
                    const option = document.createElement('option');
                    option.value = stat;
                    option.textContent = stat;
                    if (stat === booking.status) {
                        option.selected = true;
                    }
                    statusSelect.appendChild(option);
                });

                // Tạo input cho lý do
                const reasonInput = document.createElement('input');
                reasonInput.type = 'text';
                reasonInput.value = booking.reason || '';
                reasonInput.placeholder = 'Nhập lý do...';
                reasonInput.style.display = booking.status === 'Từ chối' ? 'block' : 'none';

                // Thêm event listener cho input lý do
                reasonInput.addEventListener('blur', async function() {
                    if (booking.status === 'Từ chối') {
                        try {
                            const response = await fetch('http://localhost:3000/api/bookings/status', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    id: booking.id,
                                    status: 'Từ chối',
                                    reason: this.value
                                })
                            });

                            const result = await response.json();
                            if (result.success) {
                                showToast('Cập nhật lý do thành công', 'success');
                            } else {
                                showToast(result.message || 'Cập nhật lý do thất bại', 'error');
                            }
                        } catch (error) {
                            console.error('Lỗi:', error);
                            showToast('Lỗi khi cập nhật lý do', 'error');
                        }
                    }
                });

                // Sửa lại event listener cho status select
                statusSelect.addEventListener('change', async function() {
                    const newStatus = this.value;
                    const reason = reasonInput.value;

                    try {

                        const response = await fetch('http://localhost:3000/api/bookings/status', {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                id: booking.id,
                                status: newStatus,
                                reason: newStatus === 'Từ chối' ? reason : null
                            })
                        });

                        const result = await response.json();

                        if (result.success) {
                            showToast('Cập nhật trạng thái thành công', 'success');
                            
                            // Hiển thị/ẩn input lý do
                            reasonInput.style.display = newStatus === 'Từ chối' ? 'block' : 'none';
                            
                            // Cập nhật style cho status cell
                            statusCell.style.backgroundColor = 
                                newStatus === "Nhận đơn" ? "green" :
                                newStatus === "Từ chối" ? "red" :
                                newStatus === "Chưa xử lý" ? "yellow" :
                                newStatus === "Đã xử lý"? "white": "yellow";

                            // Nếu từ chối, xóa bàn đã đặt (nếu có)
                            if (newStatus === 'Từ chối' || 'Đã xử lý' && booking.table_number) {
                                await updateTableStatus(booking.branch, booking.table_number, 'empty');
                                tableNumberCell.textContent = "Chưa có số bàn";
                            }
                        

                            // Không cần tải lại toàn bộ danh sách
                            loadBookings();
                        } else {
                            showToast(result.message || 'Cập nhật thất bại', 'error');
                        }
                    } catch (error) {
                        console.error('Lỗi:', error);
                        showToast('Lỗi khi cập nhật trạng thái', 'error');
                    }
                });

                // Thêm các elements vào cells
                statusCell.appendChild(statusSelect);
                reasonCell.appendChild(reasonInput);

                // Style cho status cell
                statusCell.style.backgroundColor =
                    booking.status === "Nhận đơn" ? "green" :
                    booking.status === "Từ chối" ? "red" : 
                    booking.status === "Chưa xử lý" ? "yellow" :
                    booking.status === "Đã xử lý"? "white": "green";;

                // Hiển thị thông tin bàn đã đặt
                if (booking.status === "Nhận đơn") {
                    const tableContainer = document.createElement("div");
                    tableContainer.className = "table-container";

                    // Tạo select để chọn bàn
                    const tableSelect = document.createElement("select");
                    tableSelect.className = "table-select";
                    
                    // Thêm option mặc định
                    const defaultOption = document.createElement("option");
                    defaultOption.value = "";
                    defaultOption.textContent = "Chọn bàn";
                    tableSelect.appendChild(defaultOption);

                    // Lấy danh sách bàn trống theo chi nhánh
                    const availableTables = await getTablesByBranch(booking.branch);
                    availableTables.forEach(table => {
                        const option = document.createElement("option");
                        option.value = table.table_number;
                        option.textContent = `${table.table_number}`;
                        tableSelect.appendChild(option);
                    });

                    // Nếu đã có bàn được đặt, hiển thị và chọn sẵn
                    if (booking.table_number) {
                        const currentTableInfo = document.createElement("div");
                        currentTableInfo.className = "current-table-info";
                        currentTableInfo.innerHTML = `<strong>Bàn ${booking.table_number}</strong>`;
                        tableContainer.appendChild(currentTableInfo);
                        
                        // Chọn sẵn bàn hiện tại trong select
                        tableSelect.value = booking.table_number;
                    }

                    tableContainer.appendChild(tableSelect);

                    // Xử lý sự kiện khi chọn bàn
                    tableSelect.addEventListener("change", async function() {
                        const tableNumber = this.value;
                        if (tableNumber) {
                            try {
                                // Nếu đã có bàn cũ, cập nhật trạng thái bàn cũ thành trống
                                if (booking.table_number) {
                                    await updateTableStatus(booking.branch, booking.table_number, 'empty');
                                }

                                await updateTableNumber(booking.id, booking.branch, tableNumber);
                                await updateTableStatus(booking.branch, tableNumber, 'reserved', {
                                    bookingDate: booking.booking_date,
                                    bookingTime: booking.time,
                                    customerName: booking.customer_name,
                                    phoneNumber: booking.phone_number
                                });
                                
                                showToast('Cập nhật số bàn thành công!', 'success');
                                loadBookings(); // Tải lại danh sách đặt bàn
                            } catch (error) {
                                console.error('Lỗi:', error);
                                showToast('Lỗi khi cập nhật số bàn!', 'error');
                                this.value = booking.table_number || ""; // Reset về giá trị cũ hoặc mặc định
                            }
                        }
                    });

                    tableNumberCell.appendChild(tableContainer);
                } else {
                    tableNumberCell.textContent = booking.table_number || "Chưa có số bàn";
                }
            });
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu đặt bàn:", error);
            showToast("Lỗi khi tải danh sách đặt bàn", "error");
        });
}

async function updateTableNumber(id, branch_id, table_number) {
    try {
        // Kiểm tra dữ liệu đầu vào
        if (!id || !branch_id || !table_number) {
            throw new Error("Thiếu thông tin cập nhật bàn");
        }

        const response = await fetch("http://localhost:3000/api/update-table-number", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                id, 
                branch_id,  // Thêm branch_id vào request
                table_number 
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Lỗi khi cập nhật số bàn");
        }

        console.log("Cập nhật số bàn thành công:", data);
        
        // Tải lại danh sách đặt bàn và bàn
        await Promise.all([
            loadBookings(),
            loadTables(branch_id)
        ]);

        return data;
    } catch (error) {
        console.error("Lỗi khi cập nhật số bàn:", error);
        throw error;
    }
}
loadBookings();

/*******************************************REVIEW**********************************************/
fetch("http://localhost:3000/api/get-reviews?hide_phone=true")
    .then(response => {
        console.log("URL Fetch:", response.url);
        return response.json();
    })
    .then(data => {
        console.log("Dữ liệu từ server:", data);
        const tableBody = document.getElementById("reviews-data");

        data.forEach(function (review) {
            const row = tableBody.insertRow();
            row.insertCell(0).textContent = review.phone_number;
            row.insertCell(1).textContent = review.stars;
            row.insertCell(2).textContent = review.comment;
            row.insertCell(3).textContent = new Date(review.created_at).toLocaleString();

            // Thêm cột nút "Ẩn/Hiện"
            const toggleCell = row.insertCell(4);
            const toggleButton = document.createElement("button");
            toggleButton.textContent = review.is_hidden ? "Hiện" : "Ẩn";
            toggleButton.className = "toggle-comment";
            toggleButton.onclick = function () {
                const newStatus = review.is_hidden ? 0 : 1;

                fetch("http://localhost:3000/api/toggle-comment", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id: review.id, is_hidden: newStatus }),
                })
                    .then((res) => res.json())
                    .then((result) => {
                        if (result.success) {
                            review.is_hidden = newStatus;
                            toggleButton.textContent = review.is_hidden ? "Hiện" : "Ẩn";
                        } else {
                            alert("Cập nhật trạng thái thất bại!");
                        }
                    })
                    .catch((err) => console.error("Lỗi khi cập nhật trạng thái:", err));
            };
            toggleCell.appendChild(toggleButton);
        });
    })
    .catch(err => console.error("Lỗi khi tải đánh giá:", err));
});

/*******************************************MENU**********************************************/

// Thêm event listener cho menu link
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - checking elements');
            
    // Kiểm tra tất cả các button trong trang
    const allButtons = document.querySelectorAll('button');
    // console.log('All buttons found:', allButtons.length);
    // allButtons.forEach(btn => {
    //     console.log('Button:', btn.id, btn.textContent);
    // });

    // Kiểm tra nút theo ID
    const addMenuBtn = document.getElementById('add-menu');
    // console.log('Add menu button by ID:', addMenuBtn);

    // Kiểm tra nút theo text
    const addMenuBtnByText = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent.includes('Thêm món')
    );
    // console.log('Add menu button by text:', addMenuBtnByText);

    if (addMenuBtn) {
        // console.log('Found add menu button with correct ID');
        addMenuBtn.addEventListener('click', async function() {
            console.log('Add menu button clicked');
    try {
                // Lấy danh sách categories từ API
                const response = await fetch('http://localhost:3000/api/categories');
        const categories = await response.json();
        console.log('Categories loaded:', categories);

                // Tạo modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Thêm món mới</h2>
                <form id="add-menu-form">
                    <div class="form-group">
                        <label for="name">Tên món:</label>
                        <input type="text" id="name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="category">Phân loại:</label>
                        <select id="category" required>
                            <option value="">Chọn phân loại</option>
                            ${categories.map(cat => `
                                <option value="${cat.id}">${cat.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="price">Giá:</label>
                        <input type="number" id="price" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="image">Hình ảnh:</label>
                        <input type="file" id="image" accept="image/*">
                    </div>
                    
                    <div class="form-group">
                        <label for="description">Mô tả:</label>
                        <textarea id="description"></textarea>
                    </div>
                    
                    <div class="modal-buttons">
                        <button type="submit">Lưu</button>
                        <button type="button" onclick="closeModal()">Hủy</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);

        // Xử lý submit form
        document.getElementById('add-menu-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData();
            formData.append('name', document.getElementById('name').value);
            formData.append('category_id', document.getElementById('category').value);
            formData.append('price', document.getElementById('price').value);
            formData.append('description', document.getElementById('description').value);
            
            const imageFile = document.getElementById('image').files[0];
            if (imageFile) {
                formData.append('image', imageFile);
            }

            try {
                        const response = await fetch('http://localhost:3000/api/menu-items', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Lỗi khi thêm món');
                }

                alert('Thêm món thành công!');
                closeModal();
                loadMenuItems(); // Tải lại danh sách món
            } catch (error) {
                console.error('Lỗi:', error);
                alert('Có lỗi xảy ra khi thêm món');
            }
        });
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra khi tải form thêm món');
    }
        });
    } else {
        console.error('Add menu button not found - check HTML ID');
    }
});

// Hàm load danh sách món ăn
async function loadMenuItems() {
    try {
        console.log('Loading menu items...');
        // Sửa lại URL để trỏ đến đúng server Node.js
        const response = await fetch('http://localhost:3000/api/menu-items');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const menuItems = await response.json();
        console.log('Đã nhận được dữ liệu:', menuItems); // Debug log
        console.log('Số lượng món ăn:', menuItems.length); // Debug log

        // Kiểm tra container tồn tại
        const menuContainer = document.getElementById('menu-items');
        if (!menuContainer) {
            console.error('Không tìm thấy container #menu-items');
            return;
        }

        displayMenuItems(menuItems);
    } catch (error) {
        console.error('Lỗi khi tải danh sách món:', error);
        alert('Có lỗi xảy ra khi tải danh sách món ăn');
    }
}

// Định nghĩa hàm xóa món ăn ở global scope
window.deleteMenuItem = async function(id) {
    console.log('Deleting menu item:', id);
    if (confirm('Bạn có chắc chắn muốn xóa món này không?')) {
        try {
            const response = await fetch(`http://localhost:3000/api/menu-items/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Lỗi khi xóa món');
            }

            alert('Xóa món thành công!');
            loadMenuItems(); // Tải lại danh sách món
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Có lỗi xảy ra khi xóa món');
        }
    }
};

// Định nghĩa hàm sửa món ăn ở global scope
window.editMenuItem = async function(id) {
    console.log('Editing menu item:', id);
    try {
        const menuResponse = await fetch(`http://localhost:3000/api/menu-items/${id}`);
        
        if (!menuResponse.ok) {
            throw new Error(`HTTP error! status: ${menuResponse.status}`);
        }
        
        const menuItem = await menuResponse.json();
        console.log('Received menu item:', menuItem);

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Sửa món ăn</h2>
                <form id="edit-menu-form" data-id="${id}">
                    <div class="form-group">
                        <label for="edit-name">Tên món:</label>
                        <input type="text" id="edit-name" value="${menuItem.name}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-price">Giá:</label>
                        <input type="number" id="edit-price" value="${menuItem.price}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-description">Mô tả:</label>
                        <textarea id="edit-description">${menuItem.ingredients || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-image">Hình ảnh mới:</label>
                        <input type="file" id="edit-image" accept="image/*">
                        ${menuItem.image_url ? 
                            `<p>Hình hiện tại: <img src="${menuItem.image_url}" style="max-width: 100px; margin-top: 5px;">` 
                            : ''}
                    </div>
                    
                    <div class="modal-buttons">
                        <button type="submit">Lưu</button>
                        <button type="button" onclick="closeModal()">Hủy</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);

        // Xử lý submit form
        document.getElementById('edit-menu-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            const itemId = this.getAttribute('data-id'); // Lấy id từ form
            console.log('Submitting edit for item:', itemId);
            
            try {
                const formData = new FormData();
                
                // Chỉ thêm vào formData những trường có giá trị
                const name = document.getElementById('edit-name').value;
                const price = document.getElementById('edit-price').value;
                const ingredients = document.getElementById('edit-description').value;
                const imageFile = document.getElementById('edit-image').files[0];

                if (name) formData.append('name', name);
                if (price) formData.append('price', price);
                if (ingredients) formData.append('ingredients', ingredients);
                if (imageFile) formData.append('image', imageFile);

                console.log('Sending update with data:', {
                    name,
                    price,
                    ingredients,
                    hasImage: !!imageFile
                });

                const response = await fetch(`http://localhost:3000/api/menu-items/${itemId}`, {
                    method: 'PUT',
                    body: formData
                });

                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error || 'Lỗi khi cập nhật món');
                }

                console.log('Update result:', result);
                alert('Cập nhật món thành công!');
                closeModal();
                loadMenuItems();
            } catch (error) {
                console.error('Lỗi:', error);
                alert(error.message || 'Có lỗi xảy ra khi cập nhật món ăn');
            }
        });
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra khi tải thông tin món ăn');
    }
};

// Hàm hiển thị danh sách món ăn
function displayMenuItems(items) {
    const menuContainer = document.getElementById('menu-items');
    if (!menuContainer) {
        console.error('Menu container not found');
        return;
    }

    console.log('Displaying menu items...');
    menuContainer.innerHTML = '';

    if (!items || items.length === 0) {
        menuContainer.innerHTML = '<p>Không có món ăn nào</p>';
        return;
    }

    // Hiển thị grid món ăn
    const menuGrid = document.createElement('div');
    menuGrid.className = 'menu-items-grid';

    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'menu-item';
        itemDiv.innerHTML = `
            <img src="${item.image_url || '../images/default.jpg'}" 
                 alt="${item.name}" 
                 onerror="this.src='../images/default.jpg'">
            <div class="menu-item-details">
                <h3>${item.name}</h3>
                <p class="price">${formatPrice(item.price)}</p>
                <p class="ingredients">${item.ingredients || ''}</p>
            </div>
            <div class="menu-item-actions">
                <button class="edit-btn">Sửa</button>
                <button class="delete-btn">Xóa</button>
            </div>
                `;

        // Thêm event listeners cho các nút
        const editBtn = itemDiv.querySelector('.edit-btn');
        const deleteBtn = itemDiv.querySelector('.delete-btn');

        editBtn.addEventListener('click', () => editMenuItem(item.id));
        deleteBtn.addEventListener('click', () => deleteMenuItem(item.id));

        menuGrid.appendChild(itemDiv);
    });

    menuContainer.appendChild(menuGrid);
    console.log(`Displayed ${items.length} menu items`);
}

// Hàm format giá tiền
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// Hàm đóng modal
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Thêm biến lưu trữ filters
let currentFilters = {
    type: 'all',
    status: 'all',
    date: ''
};

// Hàm lọc đơn hàng
function filterOrders(orders) {
    return orders.filter(order => {
        // Lọc theo loại đơn hàng
        if (currentFilters.type !== 'all' && order.order_type !== currentFilters.type) {
            return false;
        }

        // Lọc theo trạng thái
        if (currentFilters.status !== 'all' && order.status !== currentFilters.status) {
            return false;
        }

        // Lọc theo ngày
        if (currentFilters.date) {
            const orderDate = new Date(order.created_at).toLocaleDateString();
            const filterDate = new Date(currentFilters.date).toLocaleDateString();
            if (orderDate !== filterDate) {
                return false;
            }
        }

        return true;
    });
}

// Cập nhật hàm displayOrders
async function displayOrders() {
    try {
        const ordersContainer = document.getElementById('orders-container');
        if (!ordersContainer) {
            console.error('Không tìm thấy container #orders-container');
            return;
        }

        const response = await fetch('http://localhost:3000/api/orders');
        const allOrders = await response.json();
        
        // Áp dụng bộ lọc
        const filteredOrders = filterOrders(allOrders);
        
        ordersContainer.innerHTML = '';

        if (filteredOrders.length === 0) {
            ordersContainer.innerHTML = '<p class="no-orders">Không có đơn hàng nào phù hợp với bộ lọc</p>';
            return;
        }

        // Hiển thị đơn hàng đã lọc
        filteredOrders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = `order-card ${order.status}`;
            
            const today = new Date();
            // Format thời gian
            const createdAt = new Date(order.created_at).toLocaleString('vi-VN');
            // Kiểm tra ngày để hiển thị "Hôm nay" hoặc "Hôm qua"
            const orderDate = new Date(order.created_at);
            let displayDate = '';
            if (orderDate.toDateString() === today.toDateString()) {
                displayDate = 'Hôm nay ' + orderDate.getHours() + ':' + orderDate.getMinutes();
            } else if (orderDate.toDateString() === new Date(today.setDate(today.getDate() - 1)).toDateString()) {
                displayDate = 'Hôm qua';
            } else {
                displayDate = createdAt; // Hiển thị ngày bình thường
            }

            orderElement.innerHTML = `
                <div class="order-header">
                    <h3>Đơn hàng: ${order.order_id}</h3>
                    <span class="order-time">${displayDate}</span>
                </div>
                <div class="order-info">
                    <p><strong>Khách hàng:</strong> ${order.customer_name}</p>
                    <p><strong>SĐT:</strong> ${order.phone}</p>
                    <p><strong>Loại đơn:</strong> ${translateOrderType(order.order_type)}</p>
                    ${order.address ? `<p><strong>Địa chỉ:</strong> ${order.address}</p>` : ''}
                    ${order.table_number ? `<p><strong>Số bàn:</strong> ${order.table_number}</p>` : ''}
                    ${order.branch_id ? `<p><strong>Chi nhánh:</strong> ${order.branch_id}</p>` : ''}
                    <p><strong>Tổng tiền:</strong> ${formatPrice(order.total)}</p>
                    ${order.note ? `<p><strong>Ghi chú:</strong> ${order.note}</p>` : ''}
                </div>
                <div class="order-items">
                    <h4>Chi tiết đơn hàng:</h4>
                    <ul>
                        ${order.items ? order.items.map(item => `
                            <li>
                                ${item.quantity}x ${item.name} - ${formatPrice(item.price * item.quantity)}
                                ${item.note ? `<br><small>Ghi chú: ${item.note}</small>` : ''}
                            </li>
                        `).join('') : ''}
                    </ul>
                </div>
                <div class="order-actions">
                    <select class="status-select" data-order-id="${order.order_id}">
                        <option value="new" ${order.status === 'new' ? 'selected' : ''}>Mới</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Đang xử lý</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Hoàn thành</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
                    </select>
                </div>
            `;

            // Xử lý sự kiện thay đổi trạng thái
            const statusSelect = orderElement.querySelector('.status-select');
            statusSelect.addEventListener('change', async (e) => {
                try {
                    const response = await fetch(`http://localhost:3000/api/orders/${order.order_id}/status`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            status: e.target.value
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Không thể cập nhật trạng thái');
                    }

                    // Cập nhật class của order card
                    orderElement.className = `order-card ${e.target.value}`;
                    alert('Cập nhật trạng thái thành công!');
                } catch (error) {
                    console.error('Lỗi:', error);
                    alert('Có lỗi xảy ra khi cập nhật trạng thái');
                    // Reset về giá trị cũ
                    e.target.value = order.status;
                }
            });

            ordersContainer.appendChild(orderElement);
        });
    } catch (error) {
        console.error('Lỗi khi tải đơn hàng:', error);
        const ordersContainer = document.getElementById('orders-container');
        if (ordersContainer) {
            ordersContainer.innerHTML = '<p class="error-message">Có lỗi xảy ra khi tải danh sách đơn hàng</p>';
        }
    }
}

// Hàm chuyển đổi loại đơn hàng sang tiếng Việt
function translateOrderType(type) {
    const types = {
        'delivery': 'Giao hàng',
        'dine-in': 'Tại bàn',
        'takeaway': 'Mang đi'
    };
    return types[type] || type;
}

// Thêm event listeners cho các filter
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0'); // Lấy ngày và thêm 0 nếu cần
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Lấy tháng (tháng bắt đầu từ 0)
    const year = today.getFullYear();
    const todayString = `${year}-${month}-${day}`; // Định dạng ngày theo "yyyy-mm-dd"
    
    currentFilters.date = todayString; // Đặt bộ lọc ngày mặc định

    // Cập nhật giá trị cho input ngày
    const dateFilter = document.getElementById('date-filter');
    if (dateFilter) {
        dateFilter.value = todayString; // Gán giá trị cho input
        dateFilter.setAttribute('placeholder', 'Ngày hiện tại'); // Thay đổi placeholder nếu cần
    }

    // Thêm event listeners cho các filter
    const typeFilter = document.getElementById('order-type-filter');
    const statusFilter = document.getElementById('order-status-filter');

    typeFilter?.addEventListener('change', (e) => {
        currentFilters.type = e.target.value;
        displayOrders();
    });

    statusFilter?.addEventListener('change', (e) => {
        currentFilters.status = e.target.value;
        displayOrders();
    });

    dateFilter?.addEventListener('change', (e) => {
        currentFilters.date = e.target.value;
        displayOrders();
    });

    // Load đơn hàng lần đầu
    displayOrders();
});

/***********************************************CUSTOMER*******************************************/

// Hàm load dữ liệu khách hàng
async function loadCustomers() {
    try {
        const response = await fetch('http://localhost:3000/api/customers');
        const customers = await response.json();
        
        const tbody = document.querySelector('#customerTable tbody');
        if (!tbody) {
            console.error('Không tìm thấy tbody');
            return;
        }

        tbody.innerHTML = '';

        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.name || 'N/A'}</td>
                <td>${customer.email || 'N/A'}</td>
                <td>${customer.phone || 'N/A'}</td>
                <td>${formatPrice(customer.total_spent || 0)}</td>
                <td>${customer.visit_count || 0}</td>
                <td>
                    <textarea 
                        class="customer-note" 
                        data-id="${customer.id}"
                        rows="2"
                        style="width: 100%; padding: 5px;"
                    >${(customer.notes || '').trim()}</textarea>
                </td>
                <td>
                    <button onclick="viewCustomerDetails(${customer.id})" class="btn-view">
                        Chi tiết
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Thêm event listeners cho textareas
        document.querySelectorAll('.customer-note').forEach(textarea => {
            textarea.addEventListener('change', async (e) => {
                const customerId = e.target.dataset.id;
                const note = e.target.value;
                await updateCustomerNote(customerId, note);
            });
        });

    } catch (error) {
        console.error('Error loading customers:', error);
        alert('Không thể tải danh sách khách hàng');
    }
}

// Hàm cập nhật ghi chú khách hàng
async function updateCustomerNote(customerId, note) {
    try {
        const response = await fetch(`http://localhost:3000/api/customers/${customerId}/note`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ note })
        });

        if (!response.ok) {
            throw new Error('Failed to update note');
        }
        
        // Hiển thị thông báo thành công
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.textContent = 'Đã cập nhật ghi chú';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);

    } catch (error) {
        console.error('Error updating customer note:', error);
        alert('Không thể cập nhật ghi chú. Vui lòng thử lại!');
    }
}


// Load dữ liệu khi section customer được hiển thị
document.addEventListener('DOMContentLoaded', () => {
    const customerLink = document.querySelector('a[href="#customer"]');
    if (customerLink) {
        customerLink.addEventListener('click', loadCustomers);
    }
    
    // Load ngay nếu đang ở tab customer
    if (window.location.hash === '#customer') {
        loadCustomers();
    }
});

// Hàm xem chi tiết khách hàng
async function viewCustomerDetails(customerId) {
    try {
        const response = await fetch(`http://localhost:3000/api/customers/${customerId}`);
        const customer = await response.json();

        // Tạo modal hiển thị chi tiết
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        // Format thời gian
        const lastOrderDate = customer.order_history?.length 
            ? new Date(customer.order_history[0].created_at).toLocaleString('vi-VN')
            : 'Chưa có';

        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Chi tiết khách hàng</h2>
                
                <div class="customer-info">
                    <p><strong>Tên:</strong> ${customer.name || 'N/A'}</p>
                    <p><strong>Số điện thoại:</strong> ${customer.phone || 'N/A'}</p>
                    <p><strong>Email:</strong> ${customer.email || 'N/A'}</p>
                    <p><strong>Tổng chi tiêu:</strong> ${formatPrice(customer.total_spent || 0)}</p>
                    <p><strong>Số lần ghé:</strong> ${customer.visit_count || 0}</p>
                    <p><strong>Ghi chú:</strong> ${customer.notes || 'N/A'}</p>
                    <p><strong>Đơn hàng gần nhất:</strong> ${lastOrderDate}</p>
                </div>

                <div class="order-history">
                    <h3>Lịch sử đơn hàng</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Ngày đặt</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${customer.order_history ? customer.order_history.map(order => `
                                <tr>
                                    <td>${order.order_id}</td>
                                    <td>${new Date(order.created_at).toLocaleString('vi-VN')}</td>
                                    <td>${formatPrice(order.total)}</td>
                                    <td>
                                        <span class="status-badge ${order.status}">
                                            ${translateOrderStatus(order.status)}
                                        </span>
                                    </td>
                                </tr>
                            `).join('') : '<tr><td colspan="4">Chưa có đơn hàng nào</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Thêm modal vào body
        document.body.appendChild(modal);

        // Xử lý đóng modal
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = function() {
            modal.remove();
        }

    } catch (error) {
        console.error('Error loading customer details:', error);
        alert('Không thể tải thông tin chi tiết khách hàng');
    }
}

// Hàm dịch trạng thái đơn hàng
function translateOrderStatus(status) {
    const statusMap = {
        'new': 'Mới',
        'processing': 'Đang xử lý',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}


// Thêm hàm tìm kiếm khách hàng
async function searchCustomers(keyword) {
    try {
        const response = await fetch(`http://localhost:3000/api/customers/search?keyword=${encodeURIComponent(keyword)}`);
        const customers = await response.json();
        
        const tbody = document.querySelector('#customerTable tbody');
        tbody.innerHTML = '';

        if (customers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-results">
                        Không tìm thấy khách hàng phù hợp
                    </td>
                </tr>
            `;
            return;
        }

        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.name || 'N/A'}</td>
                <td>${customer.email || 'N/A'}</td>
                <td>${customer.phone || 'N/A'}</td>
                <td>${formatPrice(customer.total_spent || 0)}</td>
                <td>${customer.visit_count || 0}</td>
                <td>
                    <textarea 
                        class="customer-note" 
                        data-id="${customer.id}"
                        rows="2"
                        style="width: 100%; padding: 5px;"
                    >${(customer.notes || '').trim()}</textarea>
                </td>
                <td>
                    <button onclick="viewCustomerDetails(${customer.id})" class="btn-view">
                        Chi tiết
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Cập nhật lại event listeners cho textareas
        document.querySelectorAll('.customer-note').forEach(textarea => {
            textarea.addEventListener('change', async (e) => {
                const customerId = e.target.dataset.id;
                const note = e.target.value;
                await updateCustomerNote(customerId, note);
            });
        });

    } catch (error) {
        console.error('Error searching customers:', error);
        alert('Không thể tìm kiếm khách hàng');
    }
}

// Thêm HTML cho thanh tìm kiếm
document.querySelector('#customerTable').insertAdjacentHTML('beforebegin', `
    <div class="search-container">
        <input 
            type="text" 
            id="customer-search" 
            placeholder="Tìm kiếm theo tên, số điện thoại hoặc email..."
            class="search-input"
        >
        <button id="search-btn" class="search-btn">
            <i class="fas fa-search"></i> Tìm kiếm
        </button>
    </div>
`);

// Thêm event listeners cho tìm kiếm
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('customer-search');
    const searchBtn = document.getElementById('search-btn');

    // Tìm kiếm khi nhấn nút
    searchBtn?.addEventListener('click', () => {
        const keyword = searchInput.value.trim();
        if (keyword) {
            searchCustomers(keyword);
        } else {
            loadCustomers(); // Load lại tất cả nếu không có từ khóa
        }
    });

    // Tìm kiếm khi nhấn Enter
    searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const keyword = searchInput.value.trim();
            if (keyword) {
                searchCustomers(keyword);
            } else {
                loadCustomers();
            }
        }
    });

    // Debounce search khi gõ
    let debounceTimer;
    searchInput?.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const keyword = e.target.value.trim();
            if (keyword) {
                searchCustomers(keyword);
            } else {
                loadCustomers();
            }
        }, 500); // Đợi 500ms sau khi người dùng ngừng gõ
    });
});

/***********************************************ADMIN TABLE*******************************************/
// Thêm hàm load danh sách bàn
async function loadTables(branchId = 1) {
    console.log('loadTables function called with branchId:', branchId); // Debug log

    try {
        console.log('Fetching tables data...'); // Debug log
        const response = await fetch(`http://localhost:3000/api/tables/${branchId}`);
        const tables = await response.json();
        console.log('Received tables data:', tables); // Debug log

        const container = document.getElementById('tables-container');
        if (!container) {
            console.error('Tables container not found! Check your HTML structure.');
            return;
        }

        container.innerHTML = `
            <div class="branch-selector">
                <select id="branch-select" onchange="loadTables(this.value)">
                    <option value="1">Chi nhánh 1</option>
                    <option value="2">Chi nhánh 2</option>
                    <option value="3">Chi nhánh 3</option>
                    <option value="4">Chi nhánh 4</option>
                </select>
            </div>
            <div class="tables-grid">
                ${tables.map(table => `
                    <div class="table-item ${table.status}" 
                         onclick="showTableDetails(${table.branch_id}, '${table.table_number}')">
                        <div class="table-number">Bàn ${table.table_number}</div>
                        <div class="table-status">${getStatusText(table.status)}</div>
                        ${table.reserved_time ? 
                          `<div class="reserved-time">
                              ${new Date(table.reserved_time).toLocaleTimeString()}
                              <br>
                              ${new Date(table.reserved_time).toLocaleDateString()}
                           </div>` : ''}
                    </div>
                `).join('')}
            </div>
            <div class="status-legend">
                <div class="legend-item">
                    <div class="color-box empty"></div>
                    <span>Trống</span>
                </div>
                <div class="legend-item">
                    <div class="color-box dining"></div>
                    <span>Đang ăn</span>
                </div>
                <div class="legend-item">
                    <div class="color-box reserved"></div>
                    <span>Đã đặt</span>
                </div>
                <div class="legend-item">
                    <div class="color-box unpaid"></div>
                    <span>Chưa thanh toán</span>
                </div>
            </div>
        `;

        // Set selected branch
        const branchSelect = document.getElementById('branch-select');
        if (branchSelect) {
            branchSelect.value = branchId;
        }

    } catch (error) {
        console.error('Error in loadTables:', error);
    }
}


// Hàm chuyển đổi trạng thái sang text
function getStatusText(status) {
    const statusMap = {
        'empty': 'Trống',
        'dining': 'Đang ăn',
        'reserved': 'Đã đặt',
        'unpaid': 'Chưa thanh toán'
    };
    return statusMap[status] || status;
}

// Đảm bảo function được gọi khi tab được hiển thị
document.addEventListener('DOMContentLoaded', function() {
    // console.log('DOMContentLoaded event fired');

    // // Lấy tất cả các section có class 'content'
    const sections = document.querySelectorAll('section.tables');
    // console.log('Found sections:', sections.length);

    // Ẩn tất cả section trước
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Xử lý click event cho các link trong sidebar
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            console.log('Clicked link for:', targetId);

            // Ẩn tất cả section
            sections.forEach(section => {
                section.style.display = 'none';
            });

            // Hiển thị section được chọn
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
                if (targetId === '#tables') {
                    loadTables(1);
                }
            }

            // Cập nhật URL hash
            window.location.hash = targetId;
        });
    });
});

// Thêm xử lý chi tiết bàn
async function showTableDetails(branchId, tableNumber) {
    try {
        const response = await fetch(`http://localhost:3000/api/tables/${branchId}/${tableNumber}/details`);
        const details = await response.json();

        // Đảm bảo modal tồn tại
        const modal = createTableDetailsModal();
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="closeModal('tableDetailsModal')">&times;</span>
                <h2>Chi tiết bàn ${tableNumber}</h2>
                <div class="table-info">
                    <p><strong>Chi nhánh:</strong> ${details.branch_name}</p>
                    <p><strong>Trạng thái:</strong> <span class="status ${details.status}">${getStatusText(details.status)}</span></p>
                    
                    ${details.orders && details.orders.length > 0 ? `
                        <div class="orders-info">
                            <h3>Danh sách đơn hàng</h3>
                            ${details.orders.map(order => `
                                <div class="order-item">
                                    <p><strong>Mã đơn:</strong> ${order.order_id}</p>
                                    <p><strong>Khách hàng:</strong> ${order.customer_name}</p>
                                    <p><strong>SĐT:</strong> ${order.phone}</p>
                                    <p><strong>Trạng thái:</strong> ${order.status}</p>
                                    <p><strong>Thời gian:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                                    <p><strong>Tổng tiền:</strong> ${formatPrice(order.total)}</p>
                                </div>
                            `).join('<hr>')}
                        </div>
                    ` : '<p>Không có đơn hàng đang hoạt động</p>'}
                </div>
                <div class="modal-actions">
                    <button onclick="updateTableStatus('${branchId}', '${tableNumber}', 'empty')" 
                            class="btn btn-success">Đánh dấu hoàn thành</button>
                    <button onclick="updateTableStatus('${branchId}', '${tableNumber}', 'reserved')" 
                            class="btn btn-reserved">Đã được đặt</button>
                    <button onclick="updateTableStatus('${branchId}', '${tableNumber}', 'unpaid')" 
                            class="btn btn-warning">Chờ thanh toán</button>
                    <button onclick="updateTableStatus('${branchId}', '${tableNumber}', 'dining')" 
                            class="btn btn-dining">Đang ăn</button>
                    <button onclick="closeModal('tableDetailsModal')" 
                            class="btn btn-secondary">Đóng</button>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết bàn:', error);
        alert('Không thể tải thông tin chi tiết bàn');
    }
}

// Thêm xử lý cập nhật trạng thái
async function updateTableStatus(branchId, tableNumber, status, bookingInfo = null) {
    try {
        let formattedBookingInfo = null;
        if (bookingInfo) {
            // Chuyển đổi ngày từ bookingDate
            const bookingDate = new Date(bookingInfo.bookingDate);
            const [hours, minutes] = bookingInfo.bookingTime.split(':');

            // Format ngày tháng
            const year = bookingDate.getFullYear();
            const month = String(bookingDate.getMonth() + 1).padStart(2, '0');
            const day = String(bookingDate.getDate()).padStart(2, '0');
            
            // Format giờ phút
            const formattedHours = String(hours).padStart(2, '0');
            const formattedMinutes = String(minutes).padStart(2, '0');
            
            // Tạo datetime string đúng định dạng MySQL (YYYY-MM-DD HH:mm:ss)
            const formattedDateTime = `${year}-${month}-${day} ${formattedHours}:${formattedMinutes}:00`;
            
            formattedBookingInfo = {
                ...bookingInfo,
                reservedTime: formattedDateTime
            };

            console.log('Original booking info:', bookingInfo);
            console.log('Formatted DateTime:', formattedDateTime);
        }

        const response = await fetch(`http://localhost:3000/api/tables/${branchId}/${tableNumber}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                status,
                bookingInfo: formattedBookingInfo
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Lỗi khi cập nhật trạng thái bàn');
        }

        if (document.querySelector('#tables').style.display === 'block') {
            await loadTables(branchId);
        }

        showToast('Cập nhật trạng thái bàn thành công', 'success');
        // Thoát khỏi modal sau khi cập nhật thành công
        closeDetailsModal('tableDetailsModal');
        return data;
    } catch (error) {
        console.error('Lỗi:', error);
        showToast(error.message, 'error');
        throw error;
    }
}

// Thêm hàm đóng modal
function closeDetailsModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Thêm hàm xử lý click bên ngoài modal để đóng
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}


// Thêm hàm tạo modal nếu chưa tồn tại
function createTableDetailsModal() {
    let modal = document.getElementById('tableDetailsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tableDetailsModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    return modal;
}

// Cập nhật hàm xử lý thay đổi trạng thái đơn hàng
async function handleOrderStatusChange(orderId, newStatus) {
    try {
        const response = await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            throw new Error('Lỗi khi cập nhật trạng thái đơn hàng');
        }

        // Tải lại danh sách đơn hàng và bàn
        await loadOrders();
        const currentBranchId = document.getElementById('branch-select')?.value || '1';
        await loadTables(currentBranchId);

        // Hiển thị thông báo thành công
        alert('Cập nhật trạng thái đơn hàng thành công!');

    } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng!');
    }
}

// Thêm hàm để lấy danh sách bàn theo chi nhánh
async function getTablesByBranch(branchId) {
    try {
        const response = await fetch(`http://localhost:3000/api/tables/${branchId}`);
        const tables = await response.json();
        return tables.filter(table => table.status === 'empty'); // Chỉ lấy bàn trống
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bàn:', error);
        return [];
    }
}

// Thêm hàm hiển thị toast message
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Biến lưu trạng thái sort hiện tại
let currentSort = {
    column: -1,
    ascending: true
};

// Hàm sắp xếp bảng theo cột
function sortTable(columnIndex) {
    const table = document.getElementById("booking-table") ;
    const rows = Array.from(table.rows).slice(1); 
    const isNumeric = columnIndex === 4 ;

    // Đảo chiều sắp xếp nếu click vào cùng một cột
    if (currentSort.column === columnIndex) {
        currentSort.ascending = !currentSort.ascending;
    } else {
        currentSort.column = columnIndex;
        currentSort.ascending = true;
    }

    const sortedRows = rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex].textContent.trim();
        const cellB = rowB.cells[columnIndex].textContent.trim();
        
        let comparison;
        if (isNumeric) {
            comparison = new Date(cellA) - new Date(cellB);
        } else {
            comparison = cellA.localeCompare(cellB);
        }

        // Đảo ngược kết quả nếu sắp xếp giảm dần
        return currentSort.ascending ? comparison : -comparison;
    });

    // Cập nhật giao diện
    table.tBodies[0].append(...sortedRows);

    // Cập nhật biểu tượng sắp xếp trong header
    updateSortIndicators(table, columnIndex);
}

// Hàm cập nhật biểu tượng sắp xếp
function updateSortIndicators(table, columnIndex) {
    // Xóa tất cả indicators cũ
    const headers = table.getElementsByTagName('th');
    for (let header of headers) {
        header.classList.remove('sort-asc', 'sort-desc');
    }

    // Thêm indicator mới
    const currentHeader = headers[columnIndex];
    currentHeader.classList.add(currentSort.ascending ? 'sort-asc' : 'sort-desc');
}

// async function loadRevenueData() {
//     try {
//         const response = await fetch('http://localhost:3000/api/revenue');
//         const revenueData = await response.json();

//         // Kiểm tra nếu dữ liệu là một mảng hoặc một đối tượng
//         const revenues = Array.isArray(revenueData) ? revenueData : [revenueData];

//         const revenueTable = document.getElementById('revenue-data');
//         revenueTable.innerHTML = ''; // Clear table content before appending data

//         revenues.forEach(revenue => {
//             const row = document.createElement('tr');
//             row.innerHTML = `
//                 <td>${new Date(revenue.date).toLocaleDateString('vi-VN')}</td>
//                 <td>${parseFloat(revenue.total).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
//             `;
//             revenueTable.appendChild(row);
//         });
//     } catch (error) {
//         console.error('Lỗi khi tải dữ liệu doanh thu:', error);
//     }
// }


// Gọi hàm khi người dùng mở phần Quản lý doanh thu

document.querySelector('a[href="#revenue-report"]').addEventListener('click', () => {
    document.querySelectorAll('.main-content section').forEach(section => section.style.display = 'none');
    document.querySelector('#revenue-report').style.display = 'block';
    loadRevenueData();
});
document.addEventListener('DOMContentLoaded', () => {
    const filterBtn = document.getElementById('filter-btn');
    const dateFilter = document.getElementById('report-date-filter');
    const revenueDataContainer = document.getElementById('revenue-data');

    // Hàm tải toàn bộ dữ liệu doanh thu
    async function loadRevenueData() {
        try {
            const response = await fetch('http://localhost:3000/api/revenue');
            const revenueData = await response.json();

            // Kiểm tra nếu dữ liệu là mảng hoặc đối tượng
            const revenues = Array.isArray(revenueData) ? revenueData : [revenueData];

            // Hiển thị dữ liệu trong bảng
            displayRevenueData(revenues);
            const recentRevenues = getLast7DaysRevenue(revenues);
            drawRevenueChart(recentRevenues);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu doanh thu:', error);
        }
    }
///////////////////////////////////////////////////////////////////////////

    function getLast7DaysRevenue(revenues) {
        const today = new Date();
        const last7Days = revenues.filter(revenue => {
            const revenueDate = new Date(revenue.date);
            const diffDays = Math.floor((today - revenueDate) / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays < 7;
        });

        // Sắp xếp dữ liệu theo thứ tự ngày từ cũ đến mới
        last7Days.sort((a, b) => new Date(a.date) - new Date(b.date));
        return last7Days;
    }

    // Hàm vẽ biểu đồ doanh thu
    function drawRevenueChart(revenues) {
        const ctx = document.getElementById('revenue-chart').getContext('2d');
    
        // Đảm bảo nhãn ngày và dữ liệu tương ứng
        const labels = revenues.map(revenue => new Date(revenue.date).toLocaleDateString('vi-VN'));
        const data = revenues.map(revenue => revenue.total);
    
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh thu (VND)',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false, // Để tránh tô màu bên dưới đường đồ thị
                    tension: 0.1 // Giúp đường đồ thị mượt hơn
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Ngày'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Doanh thu (VND)'
                        },
                        beginAtZero: true // Đảm bảo trục Y bắt đầu từ 0
                    }
                }
            }
        });
    }
    

    // Hàm hiển thị dữ liệu trong bảng
    function displayRevenueData(revenues) {
        revenueDataContainer.innerHTML = ''; // Xóa dữ liệu cũ
    
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1); // Lấy ngày hôm qua
    
        revenues.forEach(revenue => {
            const revenueDate = new Date(revenue.date);
            let displayDate;
    
            // Kiểm tra và định dạng ngày
            if (revenueDate.toDateString() === today.toDateString()) {
                displayDate = 'Hôm nay';
            } else if (revenueDate.toDateString() === yesterday.toDateString()) {
                displayDate = 'Hôm qua';
            } else {
                displayDate = revenueDate.toLocaleDateString('vi-VN'); // Định dạng ngày bình thường
            }
    
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${displayDate}</td>
                <td>${parseFloat(revenue.total).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
            `;
            revenueDataContainer.appendChild(row);
        });
    }

    // Hàm lọc dữ liệu doanh thu theo ngày
    async function filterRevenueByDate(date) {
        try {
            const response = await fetch(`http://localhost:3000/api/revenue?date=${date}`);
            const filteredRevenue = await response.json();

            // Kiểm tra nếu dữ liệu là mảng hoặc đối tượng
            const revenues = Array.isArray(filteredRevenue) ? filteredRevenue : [filteredRevenue];

            // Hiển thị dữ liệu đã lọc
            displayRevenueData(revenues);
        } catch (error) {
            console.error('Lỗi khi lọc dữ liệu doanh thu:', error);
        }
    }

    // Sự kiện khi nhấn nút "Lọc"
    filterBtn.addEventListener('click', () => {
        const selectedDate = dateFilter.value;
        if (!selectedDate) {
            alert('Vui lòng chọn ngày để lọc!');
            return;
        }

        filterRevenueByDate(selectedDate);
    });

    // Tải toàn bộ dữ liệu khi trang được mở
    loadRevenueData();
});

