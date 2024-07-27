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
        handleError(error);
    }
}

function handleError(error) {
    if (error.code === 4001) {
        showNotification('Transaction rejected by user.', 'error');
    } else if (error.message.includes('insufficient funds')) {
        showNotification('Insufficient funds for gas fee.', 'error');
    } else {
        showNotification('Failed to create NFT.', 'error');
    }
}

function showNotification(message, type = 'success') {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notifications.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

document.getElementById('upload-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const fileInput = document.getElementById('music-file');
    const file = fileInput.files[0];

    if (!file) {
        showNotification('Please select a file to upload.', 'error');
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
            trackElement.tabIndex = 0;
            trackElement.addEventListener('click', () => {
                playTrack(track.url);
            });
            trackElement.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    playTrack(track.url);
                }
            });
            tracksDiv.appendChild(trackElement);
        });
    } catch (error) {
        showNotification('Failed to load tracks.', 'error');
    }
}

function playTrack(url) {
    const audioSource = document.getElementById('audio-source');
    const player = document.getElementById('player');
    audioSource.src = url;
    player.load();
    player.play();
}

window.addEventListener('load', () => {
    loadWeb3();
    loadTracks();
});