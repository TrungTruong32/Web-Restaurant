document.addEventListener('DOMContentLoaded', () => {
    // Thêm lá sen động
    createFloatingLeaves();
    
    // Animation cho các món ăn khi scroll
    observeMenuItems();
    
    // Xử lý filter danh mục
    initializeCategories();
});

// Tạo lá sen động
function createFloatingLeaves() {
    const container = document.querySelector('.floating-leaves');
    const leafCount = 40;
    
    for (let i = 0; i < leafCount; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'leaf';
        leaf.style.left = `${Math.random() * 100}%`;
        leaf.style.animationDelay = `${Math.random() * 10}s`;
        container.appendChild(leaf);
    }
}

// Quan sát và thêm animation cho các món ăn khi scroll
function observeMenuItems() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.dish-card').forEach(card => {
        observer.observe(card);
    });
}

// Xử lý filter danh mục
function initializeCategories() {
    const buttons = document.querySelectorAll('.category-btn');
    const dishes = document.querySelectorAll('.dish-card');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            buttons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const category = button.dataset.category;
            
            dishes.forEach(dish => {
                if (category === 'all' || dish.dataset.category === category) {
                    dish.style.display = 'block';
                    // Reset animation
                    dish.classList.remove('show');
                    void dish.offsetWidth; // Trigger reflow
                    dish.classList.add('show');
                } else {
                    dish.style.display = 'none';
                }
            });
        });
    });
}

const animateElement = document.querySelector('.special-image');
const mySection = document.getElementById('special-transparent');

function animateOnScroll() {
  const sectionPosition = mySection.offsetTop;
  const scrollPosition = window.scrollY;

  if (scrollPosition >= sectionPosition) {
    animateElement.classList.add('show');
  }
}

window.addEventListener('scroll', animateOnScroll);