document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const popup = document.getElementById('popup');
    const popupOverlay = document.getElementById('popup-overlay');
    const popupClose = document.getElementById('popup-close');
    const popupContent = document.getElementById('popup-content');
    const showMoreBtn = document.getElementById('show-more-btn');
    const blogContainer = document.getElementById('blog-posts');
    const blogShowMoreBtn = document.createElement('button');
    const blogPopupOverlay = document.getElementById('popup-overlay');
    const blogPopup = document.getElementById('popup');
    const blogPopupClose = document.getElementById('popup-close');
    const blogPopupContent = document.getElementById('popup-content');

    // ハンバーガーメニューのトグル
    hamburger.addEventListener('click', function () {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('open');
    });

    // スプレッドシートからデータを取得
    const sheetId = '1jTS9ebhEmPmOtRO2Ay8N_TDxMMm_nFuMdJ4Z25SdHtg';
    const apiKey = 'AIzaSyCszkaCUKnDicqAPkOjZfXLXaqeHN1yjwM';
    const portfolioRange = 'ポートフォリオ一覧!A2:E';
    const blogRange = 'News一覧!A2:E';

    const portfolioUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${portfolioRange}?key=${apiKey}`;
    const blogUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${blogRange}?key=${apiKey}`;

    let portfolios = []; // ポートフォリオデータを格納
    let displayedCount = 3; // 初期表示数

    // ポートフォリオの取得と表示
    fetch(portfolioUrl)
        .then(response => response.json())
        .then(data => {
            portfolios = data.values;
            updatePortfolioDisplay();
        });

    function updatePortfolioDisplay() {
        const portfolioContainer = document.getElementById('portfolio-items');
        let html = '';

        portfolios.slice(0, displayedCount).forEach((item, index) => {
            const [title, date, description, technology] = item;
            html += `
                <div class="portfolio-item" data-index="${index}">
                    <h3 class="portfolio-title">${title}</h3>
                    <p class="portfolio-date">日付: ${date}</p>
                    <p class="portfolio-technology">技術: ${technology}</p>
                </div>
            `;
        });

        portfolioContainer.innerHTML = html;

        // 各アイテムにクリックイベントを追加
        document.querySelectorAll('.portfolio-item').forEach(item => {
            item.addEventListener('click', function () {
                const index = item.getAttribute('data-index');
                const [title, date, description, technology] = portfolios[index];

                popupContent.innerHTML = `
                    <h3>${title}</h3>
                    <p><strong>日付:</strong> ${date}</p>
                    <p><strong>技術:</strong> ${technology}</p>
                    <p>${description}</p>
                `;
                popupOverlay.style.display = 'block';
                popup.style.display = 'flex';
                setTimeout(() => {
                    popup.classList.add('fade-in');
                }, 0);
            });
        });
    }

    // 「もっと見る」ボタンのクリックイベント
    // 「もっと見る」ボタンのクリックイベント
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', function () {
            displayedCount += 3; // 表示数を増やす
            updatePortfolioDisplay();

            if (displayedCount >= portfolios.length) {
                showMoreBtn.style.display = 'none'; // 全て表示したらボタンを非表示に
            }
        });
    } else {
        console.error('Show More button not found');
    }

    // ポップアップを閉じる
    if (popupClose) {
        popupClose.addEventListener('click', function () {
            popup.classList.remove('fade-in');
            setTimeout(() => {
                popup.style.display = 'none';
                popupOverlay.style.display = 'none';
            }, 300);
        });
    } else {
        console.error('Popup Close button not found');
    }

    let blogs = []; // ブログデータを格納
    let displayedBlogCount = 3; // 初期表示数

    // ブログの取得と表示
    fetch(blogUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (!data.values || data.values.length === 0) {
                throw new Error('No data found in the spreadsheet');
            }
            blogs = data.values;
            updateBlogDisplay();
        })
        .catch(error => {
            console.error('Error fetching blog data:', error);
            blogContainer.innerHTML = '<p>ブログデータの読み込みに失敗しました。</p>';
        });

    function updateBlogDisplay() {
        let html = '';

        blogs.slice(0, displayedBlogCount).forEach((item, index) => {
            const [date, category, title, content, colorCode] = item; // 色コードを取得
            const backgroundColor = colorCode ? `#${colorCode}` : '#007bff'; // 色コードがない場合はデフォルトを設定
    
            html += `
                <div class="blog-item" data-index="${index}">
                    <span class="blog-date">${date}</span>
                    <span class="blog-category" style="background-color: ${backgroundColor};">${category}</span>
                    <span class="blog-title">${title}</span>
                </div>
            `;
        });
    
        blogContainer.innerHTML = html;
    
        // 各アイテムにクリックイベントを追加
        document.querySelectorAll('.blog-item').forEach(item => {
            item.addEventListener('click', function () {
                const index = item.getAttribute('data-index');
                const [date, category, title, content] = blogs[index];
    
                blogPopupContent.innerHTML = `
                    <h3>${title}</h3>
                    <p><strong>日付:</strong> ${date}</p>
                    <p><strong>カテゴリ:</strong> ${category}</p>
                    <p>${content}</p>
                `;
                blogPopupOverlay.style.display = 'block';
                blogPopup.style.display = 'flex';
                setTimeout(() => {
                    blogPopup.classList.add('fade-in');
                }, 0);
            });
        });    

        // もっと見るボタンの表示制御
        if (displayedBlogCount >= blogs.length) {
            blogShowMoreBtn.style.display = 'none';
        } else {
            blogShowMoreBtn.style.display = 'inline-block';
        }
    }

    // 「もっと見る」ボタンの設定
    blogShowMoreBtn.textContent = 'もっと見る';
    blogShowMoreBtn.classList.add('show-more-btn');
    blogContainer.parentNode.appendChild(blogShowMoreBtn);

    blogShowMoreBtn.addEventListener('click', function () {
        displayedBlogCount += 3; // 表示数を増やす
        updateBlogDisplay();
    });

    // ポップアップを閉じる
    blogPopupClose.addEventListener('click', function () {
        blogPopup.classList.remove('fade-in');
        setTimeout(() => {
            blogPopup.style.display = 'none';
            blogPopupOverlay.style.display = 'none';
        }, 300);
    });

    // 背景クリックでポップアップを閉じる
    blogPopupOverlay.addEventListener('click', function () {
        blogPopup.classList.remove('fade-in');
        setTimeout(() => {
            blogPopup.style.display = 'none';
            blogPopupOverlay.style.display = 'none';
        }, 300);
    });

    if (document.getElementById('portfolio-items')) {
        fetchPortfolioData();
    }
    if (document.getElementById('blog-posts')) {
        fetchBlogData();
    }
});