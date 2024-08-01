document.addEventListener('DOMContentLoaded', () => {
    loadWeb3();
    loadUserDashboard();
    loadMarketplace();
    loadWeb3Activity();

    document.getElementById('upload-form').addEventListener('submit', handleUpload);
    document.getElementById('preview-button').addEventListener('click', previewMusic);
    document.getElementById('music-file').addEventListener('change', extractMetadata);
});

async function loadWeb3() {
    try {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            alert('Please install MetaMask to use this feature!');
        }
    } catch (error) {
        console.error('Error loading web3:', error);
        alert('Failed to load web3. Please try again.');
    }
}

async function handleUpload(event) {
    event.preventDefault();
    try {
        const file = document.getElementById('music-file').files[0];
        if (!file) {
            alert('Please select a music file to upload.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10 MB size limit
            alert('File size exceeds 10 MB. Please select a smaller file.');
            return;
        }

        const title = document.getElementById('music-title').value;
        const artist = document.getElementById('music-artist').value;
        const album = document.getElementById('music-album').value;
        const genre = document.getElementById('music-genre').value;
        const agreement = document.getElementById('mint-agreement').value;

        document.getElementById('upload-spinner').style.display = 'block';
        document.getElementById('progress-bar').style.display = 'block';

        const tokenURI = await uploadToIPFS(file);

        const accounts = await web3.eth.getAccounts();
        const contract = await loadContract();
        const receipt = await contract.methods.createNFT(tokenURI, title, artist, album, agreement).send({ from: accounts[0] });

        logWeb3Activity(`Minted NFT with Tx Hash: ${receipt.transactionHash}`);

        alert('NFT created successfully!');

    } catch (error) {
        console.error('Error creating NFT:', error);
        alert('Failed to create NFT. Please try again.');
    } finally {
        document.getElementById('upload-spinner').style.display = 'none';
        document.getElementById('progress-bar').style.display = 'none';
    }
}

async function uploadToIPFS(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer YOUR_PINATA_JWT`
            },
            body: formData,
            onprogress: (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    document.getElementById('progress-bar').value = percentComplete;
                }
            }
        });

        const data = await response.json();
        return `ipfs://${data.IpfsHash}`;
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        alert('Failed to upload file. Please try again.');
        throw error;
    }
}

async function loadContract() {
    try {
        const response = await fetch('contracts/NFTMusic.json'); // Ensure this path is correct
        const data = await response.json();
        const netId = await web3.eth.net.getId();
        console.log('Network ID:', netId);
        const deployedNetwork = data.networks[netId];
        
        if (!deployedNetwork) {
            throw new Error(`Contract not deployed on the current network (network ID: ${netId})`);
        }

        console.log('Contract Address:', deployedNetwork.address);
        return new web3.eth.Contract(data.abi, deployedNetwork && deployedNetwork.address);
    } catch (error) {
        console.error('Error loading contract:', error);
        alert('Failed to load contract. Please check the console for more details.');
        throw error;
    }
}

function loadUserDashboard() {
    try {
        // Load user tracks and royalty distribution data
    } catch (error) {
        console.error('Error loading user dashboard:', error);
        alert('Failed to load user dashboard. Please try again.');
    }
}

function loadMarketplace() {
    try {
        // Load NFTs available in the marketplace
    } catch (error) {
        console.error('Error loading marketplace:', error);
        alert('Failed to load marketplace. Please try again.');
    }
}

function loadWeb3Activity() {
    const web3ActivityFeed = document.getElementById('web3-activity-feed');
    web3ActivityFeed.innerHTML = ''; // Clear existing feed

    web3.eth.subscribe('pendingTransactions', (error, txHash) => {
        if (error) {
            console.error('Error subscribing to pending transactions:', error);
            return;
        }

        web3.eth.getTransaction(txHash, (err, tx) => {
            if (err) {
                console.error('Error getting transaction:', err);
                return;
            }

            const txElement = document.createElement('p');
            txElement.textContent = `Tx Hash: ${txHash} - From: ${tx.from} - To: ${tx.to} - Value: ${web3.utils.fromWei(tx.value, 'ether')} ETH`;
            web3ActivityFeed.prepend(txElement); // Add to the top of the feed
        });
    });
}

function logWeb3Activity(message) {
    const web3ActivityFeed = document.getElementById('web3-activity-feed');
    const activityElement = document.createElement('p');
    activityElement.textContent = message;
    web3ActivityFeed.prepend(activityElement);
}

function previewMusic() {
    const file = document.getElementById('music-file').files[0];
    if (file) {
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.src = URL.createObjectURL(file);
        const audioPlayer = document.getElementById('audio-player');
        audioPlayer.innerHTML = ''; // Clear previous audio
        audioPlayer.appendChild(audio);
        audio.play();
    } else {
        alert('Please select a music file to preview.');
    }
}

function extractMetadata() {
    const file = document.getElementById('music-file').files[0];
    if (file) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const reader = new FileReader();
        reader.onload = function (event) {
            audioContext.decodeAudioData(event.target.result, (buffer) => {
                const duration = buffer.duration;
                const sampleRate = buffer.sampleRate;
                displayMetadata(duration, sampleRate);
            }, (error) => {
                console.error('Error decoding audio file:', error);
            });
        };
        reader.readAsArrayBuffer(file);
    }
}

function displayMetadata(duration, sampleRate) {
    const durationElement = document.createElement('p');
    durationElement.textContent = `Duration: ${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')} minutes`;
    const sampleRateElement = document.createElement('p');
    sampleRateElement.textContent = `Sample Rate: ${sampleRate} Hz`;
    const metadataSection = document.getElementById('audio-player-section');
    metadataSection.appendChild(durationElement);
    metadataSection.appendChild(sampleRateElement);
}
