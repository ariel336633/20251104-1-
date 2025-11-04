// 獲取選單元素
const toggleBtn = document.getElementById('navbarToggle');
const linksBox = document.getElementById('navbarLinks');

// 點擊漢堡圖示切換選單顯示/隱藏
toggleBtn.addEventListener('click', () => {
    linksBox.classList.toggle('active');
});

// 點擊選單連結後自動關閉選單（手機端）
const menuLinks = linksBox.querySelectorAll('a');
menuLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            linksBox.classList.remove('active');
        }
    });
});
