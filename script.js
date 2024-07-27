document.addEventListener('DOMContentLoaded', () => {
    console.log('JavaScript loaded');

    // Add interactivity here
    const nftItems = document.querySelectorAll('.nft-item');
    nftItems.forEach(item => {
        item.addEventListener('click', () => {
            alert('NFT item clicked');
        });
    });

    const artistItems = document.querySelectorAll('.artist-item');
    artistItems.forEach(item => {
        item.addEventListener('click', () => {
            alert('Artist item clicked');
        });
    });

    const newsArticles = document.querySelectorAll('article');
    newsArticles.forEach(article => {
        article.addEventListener('click', () => {
            alert('News article clicked');
        });
    });
});