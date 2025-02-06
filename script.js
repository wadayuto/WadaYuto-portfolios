document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const popup = document.getElementById('popup');
    const popupOverlay = document.getElementById('popup-overlay');
    const popupClose = document.getElementById('popup-close');
    const popupContent = document.getElementById('popup-content');
    const showMoreBtn = document.getElementById('show-more-btn');
    const portfolioContainer = document.getElementById('portfolio-items');
    const blogContainer = document.getElementById('blog-posts');
    const blogShowMoreBtn = document.createElement('button');

    // ハンバーガーメニューのトグル
    hamburger.addEventListener('click', function () {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('open');
    });

    // ポップアップを開くときにスクロールを無効化
    function openPopup(content) {
        popupContent.innerHTML = content;
        popupOverlay.style.display = 'block';
        popup.style.display = 'flex';
        setTimeout(() => {
            popup.classList.add('fade-in');
        }, 0);
        document.body.classList.add('no-scroll'); // 背景スクロールを無効化
    }

    // ポップアップを閉じるときにスクロールを復活
    function closePopup() {
        popup.classList.remove('fade-in');
        setTimeout(() => {
            popup.style.display = 'none';
            popupOverlay.style.display = 'none';
            document.body.classList.remove('no-scroll'); // 背景スクロールを有効化
        }, 300);
    }

    // 「閉じる」ボタンが存在する場合はクリックイベントを設定
    if (popupClose) {
        popupClose.addEventListener('click', closePopup);
    } else {
        console.error('Popup Close button not found');
    }

    // 背景（オーバーレイ）をクリックした場合にポップアップを閉じる
    if (popupOverlay) {
        popupOverlay.addEventListener('click', function (e) {
            if (e.target === popupOverlay) {
                closePopup();
            }
        });
    }

    // スプレッドシートからデータを取得
    const sheetId = '1jTS9ebhEmPmOtRO2Ay8N_TDxMMm_nFuMdJ4Z25SdHtg';
    const apiKey = 'AIzaSyCszkaCUKnDicqAPkOjZfXLXaqeHN1yjwM';
    const portfolioRange = 'ポートフォリオ一覧!A2:I';
    const blogRange = 'News一覧!A2:H';

    const portfolioUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${portfolioRange}?key=${apiKey}`;
    const blogUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${blogRange}?key=${apiKey}`;

    // GoogleドライブのURLを変換する（必要な場合）
    function transformGoogleDriveUrl(url) {
        if (url.includes('drive.google.com')) {
            // パターン1: /d/FILE_ID/...
            let fileIdMatch = url.match(/\/d\/([^/]+)/);
            if (fileIdMatch && fileIdMatch[1]) {
                return `https://drive.google.com/uc?id=${fileIdMatch[1]}`;
            }
            // パターン2: open?id=FILE_ID
            const idParamMatch = url.match(/[?&]id=([^&]+)/);
            if (idParamMatch && idParamMatch[1]) {
                return `https://drive.google.com/uc?id=${idParamMatch[1]}`;
            }
        }
        return url;
    }

    let portfolios = []; // ポートフォリオデータを格納
    let displayedCount = 3; // 初期表示数

    // ポートフォリオの取得と表示
    fetch(portfolioUrl)
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
        portfolios = data.values;
        updatePortfolioDisplay();
    })
    .catch(error => {
        console.error('Error fetching portfolios data:', error);
        portfolioContainer.innerHTML = '<p>ポートフォリオは現在ございません</p>';
    });

    function updatePortfolioDisplay() {
        const portfolioContainer = document.getElementById('portfolio-items');
        let html = '';

        portfolios.slice(0, displayedCount).forEach((item, index) => {
            // ※変数名「projectUrlsText」に修正
            let [title, date, description, technology, projectUrlsText, projectUrls, referenceUrlsText, referenceUrls, imageUrls] = item;
            description = description || '';
            const formattedDescription = description.replace(/\r?\n/g, "<br>");
            html += `
                <div class="portfolio-item" data-index="${index}">
                    <h3 class="portfolio-title">${title}</h3>
                    <p class="portfolio-date">日付: ${date}</p>
                    <p class="portfolio-technology">技術: ${technology}</p>
                </div>
            `;
        });

        portfolioContainer.innerHTML = html;

        // 各ポートフォリオアイテムにクリックイベントを追加
        document.querySelectorAll('.portfolio-item').forEach(item => {
            item.addEventListener('click', function () {
                const index = item.getAttribute('data-index');
                let [title, date, description, technology, projectUrlsText = '', projectUrls = '', referenceUrlsText = '', referenceUrls = '', imageUrls = ''] = portfolios[index];
                description = description || '';
                const formattedDescription = description.replace(/\r?\n/g, "<br>");

                // 作品URLをリスト形式に変換
                let projectLinks = '';
                if (projectUrls) {
                    const projectUrlList = projectUrls.split(',');
                    const linkTextList = projectUrlsText.split(',');
                    projectLinks = projectUrlList.map((url, i) => {
                        return `<li><a href="${url.trim()}" target="_blank">${linkTextList[i]?.trim() || "作品リンク"}</a></li>`;
                    }).join('');
                    projectLinks = `<p><strong>作品URL:</strong></p><ul>${projectLinks}</ul>`;
                }

                // 参考URLをリスト形式に変換
                let referenceLinks = '';
                if (referenceUrls) {
                    const referenceUrlList = referenceUrls.split(',');
                    const linkTextList = referenceUrlsText.split(',');
                    referenceLinks = referenceUrlList.map((url, i) => {
                        return `<li><a href="${url.trim()}" target="_blank">${linkTextList[i]?.trim() || "参考リンク"}</a></li>`;
                    }).join('');
                    referenceLinks = `<p><strong>参考URL:</strong></p><ul>${referenceLinks}</ul>`;
                }

                // 画像ギャラリーを生成（GoogleドライブのURL変換も実施）
                let imageGallery = '';
                if (imageUrls) {
                    const imageList = imageUrls.split(',').map(url => {
                        const trimmedUrl = transformGoogleDriveUrl(url.trim());
                        return `<img src="${trimmedUrl}" alt="作品画像" class="popup-image">`;
                    }).join('');
                    imageGallery = `<div class="popup-image-container">${imageList}</div>`;
                }

                openPopup(`
                    <h3>${title}</h3>
                    <p><strong>日付:</strong> ${date}</p>
                    <p><strong>技術:</strong> ${technology}</p>
                    ${projectLinks}
                    ${referenceLinks}
                    ${imageGallery}
                    <p>${formattedDescription}</p>
                `);
            });
        });

        // 「もっと見る」ボタンの表示制御（すべて表示済みなら非表示）
        if (showMoreBtn && displayedCount >= portfolios.length) {
            showMoreBtn.style.display = 'none';
        }
    }

    // 「もっと見る」ボタンのクリックイベント（ポートフォリオ）
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', function () {
            displayedCount += 3; // 表示数を増やす
            updatePortfolioDisplay();
        });
    } else {
        console.error('Show More button not found');
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
            blogContainer.innerHTML = '<p>ブログ記事は現在ございません</p>';
        });

    function updateBlogDisplay() {
        let html = '';

        blogs.slice(0, displayedBlogCount).forEach((item, index) => {
            let [date, category, title, content, colorCode, linkText, referenceUrls, imageUrls] = item;
            content = content || '';
            const formattedContent = content.replace(/\r?\n/g, "<br>");
            const backgroundColor = colorCode ? `#${colorCode}` : '#007bff';

            html += `
                <div class="blog-item" data-index="${index}">
                    <span class="blog-date">${date}</span>
                    <span class="blog-category" style="background-color: ${backgroundColor};">${category}</span>
                    <span class="blog-title">${title}</span>
                </div>
            `;
        });
    
        blogContainer.innerHTML = html;
    
        // 各ブログアイテムにクリックイベントを追加
        document.querySelectorAll('.blog-item').forEach(item => {
            item.addEventListener('click', function () {
                const index = item.getAttribute('data-index');
                let [date, category, title, content, colorCode, linkText = '', referenceUrls = '', imageUrls = ''] = blogs[index];
                content = content || '';
                const formattedContent = content.replace(/\r?\n/g, "<br>");

                let referenceLinks = '';
                if (referenceUrls) {
                    const referenceUrlList = referenceUrls.split(',');
                    const linkTextList = linkText.split(',');
                    referenceLinks = referenceUrlList.map((url, i) => {
                        return `<li><a href="${url.trim()}" target="_blank">${linkTextList[i]?.trim() || "参考リンク"}</a></li>`;
                    }).join('');
                    referenceLinks = `<p><strong>参考URL:</strong></p><ul>${referenceLinks}</ul>`;
                }

                // 画像ギャラリーを生成
                let imageGallery = '';
                if (imageUrls) {
                    const imageList = imageUrls.split(',').map(url => {
                        const trimmedUrl = transformGoogleDriveUrl(url.trim());
                        return `<img src="${trimmedUrl}" alt="ブログ画像" class="popup-image">`;
                    }).join('');
                    imageGallery = `<div class="popup-image-container">${imageList}</div>`;
                }

                openPopup(`
                    <h3>${title}</h3>
                    <p><strong>日付:</strong> ${date}</p>
                    <p><strong>カテゴリ:</strong> ${category}</p>
                    ${referenceLinks}
                    ${imageGallery}
                    <p>${formattedContent}</p>
                `);
            });
        });    

        // 「もっと見る」ボタンの表示制御（ブログ）
        if (displayedBlogCount >= blogs.length) {
            blogShowMoreBtn.style.display = 'none';
        } else {
            blogShowMoreBtn.style.display = 'inline-block';
        }
    }

    // 「もっと見る」ボタンの設定（ブログ）
    blogShowMoreBtn.textContent = 'もっと見る';
    blogShowMoreBtn.classList.add('show-more-btn');
    if (blogContainer.parentNode) {
        blogContainer.parentNode.appendChild(blogShowMoreBtn);
    }

    blogShowMoreBtn.addEventListener('click', function () {
        displayedBlogCount += 3; // 表示数を増やす
        updateBlogDisplay();
    });
});
