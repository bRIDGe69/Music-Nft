
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
        showNotification('NFT created successfully!');
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
    }, 3000);
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
            response.body.on('data', (chunk) => {
                const percentComplete = (chunk.byteLength / response.headers.get('Content-Length')) * 100;
                progressBar.value = percentComplete;
            });

            response.body.on('end', async () => {
                uploadProgress.style.display = 'none';
                showNotification('File uploaded successfully!');
                const data = await response.json();
                const tokenURI = data.fileUrl;
                await createNFT(tokenURI);
                loadTracks();
            });
        } else {
            uploadProgress.style.display = 'none';
            showNotification('File upload failed.', 'error');
            console.error('File upload failed', response);
        }
    } catch (error) {
        uploadProgress.style.display = 'none';
        showNotification('An error occurred during upload.', 'error');
        console.error('Upload error', error);
    }
});

async function loadTracks() {
    console.log('Loading tracks');
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
        console.log('Tracks loaded', tracks);
    } catch (error) {
        showNotification('Failed to load tracks.', 'error');
        console.error('Error loading tracks', error);
    }
}

loadWeb3();
loadTracks();
