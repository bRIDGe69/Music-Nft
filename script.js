document.addEventListener('DOMContentLoaded', () => {
    loadWeb3();
    loadUserProfile();
    loadUserDashboard();
    loadMarketplace();
    loadWeb3Activity();

    document.getElementById('upload-form').addEventListener('submit', handleUpload);
    document.getElementById('profile-form').addEventListener('submit', saveUserProfile);
    document.getElementById('feedback-form').addEventListener('submit', handleFeedback);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    loadFeedback();
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

function loadUserProfile() {
    try {
        const username = localStorage.getItem('username');
        const email = localStorage.getItem('email');
        if (username) document.getElementById('username').value = username;
        if (email) document.getElementById('email').value = email;
    } catch (error) {
        console.error('Error loading user profile:', error);
        alert('Failed to load user profile. Please try again.');
    }
}

function saveUserProfile(event) {
    event.preventDefault();
    try {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        localStorage.setItem('username', username);
        localStorage.setItem('email', email);
        alert('Profile saved successfully!');
    } catch (error) {
        console.error('Error saving user profile:', error);
        alert('Failed to save user profile. Please try again.');
    }
}

async function handleUpload(event) {
    event.preventDefault();
    try {
        const file = document.getElementById('music-file').files[0];
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
        
        playMusic(file);

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
            body: formData
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
        const deployedNetwork = data.networks[netId];
        
        if (!deployedNetwork) {
            throw new Error('Contract not deployed on the current network');
        }

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

function handleFeedback(event) {
    event.preventDefault();
    try {
        const feedbackText = document.getElementById('feedback-text').value;
        if (!feedbackText) return alert('Feedback cannot be empty.');

        const feedbackList = document.getElementById('feedback-list');
        const feedbackItem = document.createElement('div');
        feedbackItem.textContent = feedbackText;
        feedbackList.appendChild(feedbackItem);

        document.getElementById('feedback-text').value = '';
        saveFeedback(feedbackText);
    } catch (error) {
        console.error('Error handling feedback:', error);
        alert('Failed to submit feedback. Please try again.');
    }
}

function saveFeedback(feedback) {
    try {
        let feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
        feedbacks.push(feedback);
        localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    } catch (error) {
        console.error('Error saving feedback:', error);
        alert('Failed to save feedback. Please try again.');
    }
}

function loadFeedback() {
    try {
        let feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
        const feedbackList = document.getElementById('feedback-list');
        feedbacks.forEach(feedback => {
            const feedbackItem = document.createElement('div');
            feedbackItem.textContent = feedback;
            feedbackList.appendChild(feedbackItem);
        });
    } catch (error) {
        console.error('Error loading feedback:', error);
        alert('Failed to load feedback. Please try again.');
    }
}

function toggleTheme() {
    try {
        document.body.classList.toggle('dark');
    } catch (error) {
        console.error('Error toggling theme:', error);
        alert('Failed to toggle theme. Please try again.');
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

function playMusic(file) {
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = URL.createObjectURL(file);
    document.getElementById('audio-player').appendChild(audio);
    audio.play();
}
