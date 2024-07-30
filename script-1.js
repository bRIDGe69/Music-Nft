document.addEventListener('DOMContentLoaded', () => {
    loadWeb3();
    loadUserProfile();
    loadUserDashboard();
    loadMarketplace();

    document.getElementById('upload-form').addEventListener('submit', handleUpload);
    document.getElementById('profile-form').addEventListener('submit', saveUserProfile);
    document.getElementById('feedback-form').addEventListener('submit', handleFeedback);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    loadFeedback();
});

async function loadWeb3() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
    } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
    } else {
        alert('Please install MetaMask to use this feature!');
    }
}

function loadUserProfile() {
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    if (username) document.getElementById('username').value = username;
    if (email) document.getElementById('email').value = email;
}

function saveUserProfile(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);
    alert('Profile saved successfully!');
}
async function handleUpload(event) {
    event.preventDefault();
    const file = document.getElementById('music-file').files[0];
    const title = document.getElementById('music-title').value;
    const artist = document.getElementById('music-artist').value;
    const album = document.getElementById('music-album').value;
    const genre = document.getElementById('music-genre').value;
    const agreement = document.getElementById('mint-agreement').value;

    if (!file || !title || !artist) return alert('Please fill all the required fields.');

    const reader = new FileReader();
    reader.onloadend = async () => {
        const buffer = Buffer.from(reader.result);
        const tokenURI = await uploadToIPFS(buffer);
        await mintNFT(tokenURI, title, artist, album, genre, agreement);
        alert('File uploaded and NFT minted successfully!');
        loadTracks();
    };
    reader.readAsArrayBuffer(file);

    const preview = document.getElementById('music-preview');
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
}

async function uploadToIPFS(buffer) {
    // Placeholder for IPFS upload logic
    // Return the IPFS URL of the uploaded file
    return "ipfs://fake-ipfs-url";
}

async function mintNFT(tokenURI, title, artist, album, genre, agreement) {
    const accounts = await web3.eth.getAccounts();
    const contract = await loadContract();
    await contract.methods.createNFT(tokenURI, title, artist, album, genre, agreement).send({ from: accounts[0] });
}

async function loadContract() {
    const response = await fetch('/contracts/NFTMusic.json');
    const data = await response.json();
    const netId = await web3.eth.net.getId();
    const deployedNetwork = data.networks[netId];
    return new web3.eth.Contract(data.abi, deployedNetwork && deployedNetwork.address);
}

async function loadTracks() {
    // Implement the logic to load and display tracks from the marketplace
}

function loadUserDashboard() {
    // Load user tracks and royalty distribution data
}

function loadMarketplace() {
    // Load NFTs available in the marketplace
}

function handleFeedback(event) {
    event.preventDefault();
    const feedbackText = document.getElementById('feedback-text').value;
    if (!feedbackText) return alert('Feedback cannot be empty.');

    const feedbackList = document.getElementById('feedback-list');
    const feedbackItem = document.createElement('div');
    feedbackItem.textContent = feedbackText;
    feedbackList.appendChild(feedbackItem);

    document.getElementById('feedback-text').value = '';
    saveFeedback(feedbackText);
}

function saveFeedback(feedback) {
    let feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    feedbacks.push(feedback);
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
}

function loadFeedback() {
    let feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    const feedbackList = document.getElementById('feedback-list');
    feedbacks.forEach(feedback => {
        const feedbackItem = document.createElement('div');
        feedbackItem.textContent = feedback;
        feedbackList.appendChild(feedbackItem);
    });
}

function toggleTheme() {
    document.body.classList.toggle('dark');
}
