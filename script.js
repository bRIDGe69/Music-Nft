console.log('Script loaded');

async function loadWeb3() {
    console.log('Loading Web3');
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        console.log('Ethereum enabled');
    } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
        console.log('Web3 enabled via current provider');
    } else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
}

async function loadContract() {
    console.log('Loading contract');
    const response = await fetch('/MusicNFT.json');
    const data = await response.json();
    const netId = await web3.eth.net.getId();
    const deployedNetwork = data.networks[netId];
    console.log('Contract loaded', deployedNetwork);
    return new web3.eth.Contract(data.abi, deployedNetwork && deployedNetwork.address);
}

async function createNFT(tokenURI) {
    console.log('Creating NFT', tokenURI);
    try {
        const accounts = await web3.eth.getAccounts();
        const contract = await loadContract();
        await contract.methods.createNFT(tokenURI).send({ from: accounts[0] });
        showNotification('NFT created successfully!', 'success');
        console.log('NFT created successfully');
    } catch (error) {
        console.error('Error creating NFT', error);
        if (error.code === 4001) {
            showNotification('Transaction rejected by user.', 'error');
        } else if (error.message.includes('insufficient funds')) {
            showNotification('Insufficient funds for gas fee.', 'error');
        } else {
            showNotification('Failed to create NFT.', 'error');
        }
    }
}

function showNotification(message, type = 'success') {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notifications.appendChild(notification);
    setTimeout(() => {
        notifications.removeChild(notification);
    }, 5000); // Increased display duration for better user visibility
}

document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('music-file').files[0];
    console.log('File selected', file);
    if (!file) {
        showNotification('Please select a file to upload.', 'error');
        return;
    }

    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac'];
    if (!validTypes.includes(file.type)) {
        showNotification('Unsupported file type. Please upload an MP3, WAV, or FLAC file.', 'error');
        return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showNotification('File size exceeds 10MB limit. Please upload a smaller file.', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('music', file);

    const uploadProgress = document.getElementById('upload-progress');
    const progressBar = document.getElementById('progress-bar');
    uploadProgress.style.display = 'block';

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            const tokenURI = data.fileUrl;
            await createNFT(tokenURI);
            showNotification('File uploaded successfully!', 'success');
            loadTracks();
        } else {
            showNotification('File upload failed.', 'error');
        }
    } catch (error) {
        showNotification('An error occurred during upload.', 'error');
    } finally {
        uploadProgress.style.display = 'none';
    }
});

async function loadTracks() {
    try {
        const response = await fetch('/tracks');
        const tracks = await response.json();
        const tracksDiv = document.getElementById('tracks');
        tracksDiv.innerHTML = '';
        tracks.forEach(track => {
            const trackElement = document.createElement('div');
            trackElement.textContent = track.name;
            trackElement.addEventListener('click', () => {
                document.getElementById('audio-source').src = track.url;
                document.getElementById('player').load();
                document.getElementById('player').play();
            });
            tracksDiv.appendChild(trackElement);
        });
    } catch (error) {
        showNotification('Failed to load tracks.', 'error');
    }
}

// Profile management
document.getElementById('profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);
    showNotification('Profile updated successfully!', 'success');
});

function loadUserProfile() {
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    if (username) {
        document.getElementById('username').value = username;
    }
    if (email) {
        document.getElementById('email').value = email;
    }
}

function loadUserDashboard() {
    const userTracks = JSON.parse(localStorage.getItem('userTracks')) || [];
    const userPlaylists = JSON.parse(localStorage.getItem('userPlaylists')) || [];
    const userPurchases = JSON.parse(localStorage.getItem('userPurchases')) || [];

    const userTracksDiv = document.getElementById('user-tracks');
    userTracksDiv.innerHTML = '<h3>Your Uploaded Tracks</h3>';
    userTracks.forEach(track => {
        const trackElement = document.createElement('div');
        trackElement.textContent = track.name;
        userTracksDiv.appendChild(trackElement);
    });

    const userPlaylistsDiv = document.getElementById('user-playlists');
    userPlaylistsDiv.innerHTML = '<h3>Your Playlists</h3>';
    userPlaylists.forEach(playlist => {
        const playlistElement = document.createElement('div');
        playlistElement.textContent = playlist.name;
        userPlaylistsDiv.appendChild(playlistElement);
    });

    const userPurchasesDiv = document.getElementById('user-purchases');
    userPurchasesDiv.innerHTML = '<h3>Your Purchased NFTs</h3>';
    userPurchases.forEach(purchase => {
        const purchaseElement = document.createElement('div');
        purchaseElement.textContent = purchase.name;
        userPurchasesDiv.appendChild(purchaseElement);
    });
}

document.getElementById('search-button').addEventListener('click', () => {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const tracksDiv = document.getElementById('tracks');
    const trackElements = tracksDiv.getElementsByTagName('div');
    Array.from(trackElements).forEach(trackElement => {
        const trackName = trackElement.textContent.toLowerCase();
        if (trackName.includes(searchInput)) {
            trackElement.style.display = '';
        } else {
            trackElement.style.display = 'none';
        }
    });
});

document.getElementById('add-comment-button').addEventListener('click', () => {
    const commentInput = document.getElementById('comment-input').value;
    if (commentInput) {
        const commentsList = document.getElementById('comments-list');
        const commentElement = document.createElement('div');
        commentElement.textContent = commentInput;
        commentsList.appendChild(commentElement);
        document.getElementById('comment-input').value = '';
        showNotification('Comment added successfully!', 'success');
    } else {
        showNotification('Comment cannot be empty.', 'error');
    }
});

document.getElementById('add-rating-button').addEventListener('click', () => {
    const ratingInput = document.getElementById('rating-input').value;
    if (ratingInput >= 1 && ratingInput <= 5) {
        const ratingsList = document.getElementById('ratings-list');
        const ratingElement = document.createElement('div');
        ratingElement.textContent = `Rating: ${ratingInput}`;
        ratingsList.appendChild(ratingElement);
        document.getElementById('rating-input').value = '';
        showNotification('Rating added successfully!', 'success');
    } else {
        showNotification('Rating must be between 1 and 5.', 'error');
    }
});

window.addEventListener('load', () => {
    loadUserProfile();
    loadUserDashboard();
    loadWeb3();
    loadTracks();
});
