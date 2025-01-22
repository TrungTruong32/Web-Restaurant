// Hàm load components
async function loadComponent(url, elementId) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;

        // Nếu là footer, thêm xử lý map
        if (elementId === 'footer-container') {
            initializeMapHandlers();
        }

        // Đánh dấu link active trong navigation
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

// Hàm xử lý map
function initializeMapHandlers() {
    const addresses = document.querySelectorAll('.address');
    const mapFrame = document.getElementById('mapFrame');
    let activeAddress = null; // Lưu địa chỉ đang được chọn

    if (!addresses.length || !mapFrame) {
        console.log('Đang đợi elements được load...');
        return;
    }

    console.log('Đã tìm thấy:', addresses.length, 'địa chỉ');

    const mapUrls = {
        "227 Nguyễn Văn Cừ, Phường 4, Quận 5, Thành phố Hồ Chí Minh.": 
            "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.6383805304185!2d106.68014900995466!3d10.762327989341344!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f1953a6e961%3A0xc77e334f1510b975!2zxJDhuqFpIEjhu41jIEtob2EgSOG7jWMgVOG7sSBOaGnDqm4gLSAyMjcgTmd1eeG7hW4gVsSDbiBD4bur!5e0!3m2!1svi!2s!4v1735491831063!5m2!1svi!2s",

            "268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM.":
            "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4559084314944!2d106.65796857460266!3d10.77062438937799!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752ec3c161a3fb%3A0xef77cd47a1cc691e!2zMjY4IEzDvSBUaMaw4budbmcgS2nhu4d0!5e0!3m2!1svi!2s!4v1710900000000!5m2!1svi!2s",
        
        "123 Khu phố 6, phường Linh Trung, quận Thủ Đức, TP.HCM.":
            "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.485298839788!2d106.77241557460397!3d10.870117089331176!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527587e9ad5bf%3A0xafa66f9c8be3c91!2zS2h1IHBo4buRIDYsIExpbmggVHJ1bmcsIFRo4bunIMSQ4bupYywgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5o!5e0!3m2!1svi!2s!4v1710900000000!5m2!1svi!2s",
        
        "36 Tôn Thất Đạm, Quận 1, Thành phố Hồ Chí Minh.":
            "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4559084314944!2d106.70496857460266!3d10.77062438937799!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4a8a30e3db%3A0x8def1dcf7c5c3d49!2zMzYgVMO0biBUaOG6pXQgxJDhuqFtLCBC4bq_biBOZ2jDqSwgUXXhuq1uIDEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaA!5e0!3m2!1svi!2s!4v1710900000000!5m2!1svi!2s"
    };

    // Thêm class loading cho map
    mapFrame.classList.add('map-container');

    addresses.forEach(address => {
        address.addEventListener('click', function() {
            // Xóa highlight và inline style của địa chỉ cũ
            if (activeAddress) {
                activeAddress.classList.remove('address-active');
                activeAddress.style.removeProperty('color'); // Xóa inline style
            }

            // Highlight địa chỉ mới
            this.classList.add('address-active');
            activeAddress = this;

            const mapUrl = mapUrls[this.textContent.trim()];
            
            if (mapUrl) {
                // Thêm hiệu ứng fade out
                mapFrame.classList.add('map-loading');
                
                // Đợi animation fade out hoàn thành
                setTimeout(() => {
                    mapFrame.src = mapUrl;
                    
                    // Xử lý khi map load xong
                    mapFrame.onload = () => {
                        mapFrame.classList.remove('map-loading');
                    };

                    // Scroll đến map với animation mượt
                    mapFrame.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 300); // Đợi 300ms cho animation fade out
            }
        });

        // Cập nhật hiệu ứng hover
        address.addEventListener('mouseenter', function() {
            if (this !== activeAddress) {
                this.style.color = 'var(--third-color)';
            }
        });

        address.addEventListener('mouseleave', function() {
            if (this !== activeAddress) {
                this.style.removeProperty('color'); // Xóa inline style khi hover out
            }
        });
    });
}

// Thêm hàm load action buttons
function loadActionButtons() {
    const actionButtons = `
        <div id="take-action-order" class="take-action-order" onclick="window.location.href='order.html'">
            GỌI MÓN
            </div>
        <div id="take-action-order-con" class="take-action-order-con" onclick="window.location.href='booking_table.html'">
            ĐẶT BÀN
        </div>
        `;

    // Tạo container cho buttons
    const actionContainer = document.createElement('div');
    actionContainer.innerHTML = actionButtons;
    document.body.appendChild(actionContainer);

    // Thêm styles cho buttons
    const style = document.createElement('style');
    style.textContent = `
        .take-action-order {
            position: fixed;
            z-index: 999;
            top: 130px;
            right: 0;
            width: 20px;
            height: 100px;
            border-radius: 0;
            background-color: #8a0000;
            transition: all 0.3s ease-in-out;
            color: var(--fourth-color);
            writing-mode: vertical-rl;
            font-size: larger;
            text-align: center;
            cursor: pointer;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
        }

        .take-action-order-con {
            position: fixed;
            z-index: 999;
            top: 250px;
            right: 0px;
            width: 20px;
            height: 100px;
            border-radius: 0;
            background-color: #8a0000;
            transition: all 0.3s ease-in-out;
            color: var(--fourth-color);
            writing-mode: vertical-rl;
            font-size: larger;
            text-align: center;
            cursor: pointer;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
        }

        .take-action-order:hover,
        .take-action-order-con:hover {
            left: 5px;
            background-color: #b30000;
            box-shadow: 4px 4px 8px rgba(0,0,0,0.3);
        }

        /* Responsive design */
        @media (max-width: 768px) {
            .take-action-order,
            .take-action-order-con {
                width: 15px;
                height: 80px;
                font-size: medium;
            }
            
            .take-action-order {
                top: 100px;
            }
            
            .take-action-order-con {
                top: 200px;
            }
        }
    `;
    document.head.appendChild(style);
}

// Cập nhật hàm init để thêm action buttons
document.addEventListener('DOMContentLoaded', () => {
    // Load header nếu có container
    if (document.getElementById('header-container')) {
        loadComponent('../components/header.html', 'header-container');
    }
    
    // Load footer nếu có container
    if (document.getElementById('footer-container')) {
        loadComponent('../components/footer.html', 'footer-container');
    }

    // Load action buttons
    loadActionButtons();
}); 