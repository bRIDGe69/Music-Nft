document.getElementById('connectWallet').addEventListener('click', async function() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            document.getElementById('walletAddress').innerText = `Connected: ${account}`;
            web3 = new Web3(window.ethereum);
        } catch (error) {
            console.error('User denied account access', error);
            document.getElementById('walletAddress').innerText = 'Connection failed. Please try again.';
        }
    } else {
        console.log('No Ethereum provider detected');
        document.getElementById('walletAddress').innerText = 'No Ethereum provider detected';
    }
});

document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const fileInput = document.getElementById('musicFile');
    const file = fileInput.files[0];
    if (!file) {
        document.getElementById('uploadStatus').innerText = 'Please select a file to upload.';
        return;
    }

    document.getElementById('spinner').style.display = 'block';

    // Read file as Data URL and store in localStorage
    const reader = new FileReader();
    reader.onload = async function(event) {
        const fileUrl = event.target.result;
        localStorage.setItem('uploadedMusic', fileUrl);

        document.getElementById('spinner').style.display = 'none';
        document.getElementById('uploadStatus').innerText = 'File uploaded successfully!';
        const audioPlayer = document.getElementById('audioPlayer');
        const audioSource = document.getElementById('audioSource');
        audioSource.src = fileUrl;
        audioPlayer.classList.remove('hidden');
        audioPlayer.load();

        // Smart contract interaction options
        await handleContractOptions(fileUrl);
    };
    reader.readAsDataURL(file);
});

async function handleContractOptions(fileUrl) {
    // Assuming web3 is already initialized
    const contractAddress = 'YOUR_SMART_CONTRACT_ADDRESS';
    const contractABI = YOUR_SMART_CONTRACT_ABI;
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    document.getElementById('transactionSpinner').style.display = 'block';

    // Example minting function
    await mintNFT(contract, account, fileUrl);

    // Additional smart contract functions
    // Example: transfer ownership
    await transferOwnership(contract, account, 'NEW_OWNER_ADDRESS');

    // Example: update metadata
    await updateMetadata(contract, account, fileUrl, 'NEW_METADATA');

    document.getElementById('transactionSpinner').style.display = 'none';
}

async function mintNFT(contract, account, fileUrl) {
    const transaction = contract.methods.mintNFT(account, fileUrl);
    const options = {
        from: account,
        gas: await transaction.estimateGas(),
    };

    transaction.send(options)
        .on('transactionHash', hash => {
            console.log('Transaction Hash:', hash);
        })
        .on('receipt', receipt => {
            console.log('Transaction Receipt:', receipt);
            document.getElementById('uploadStatus').innerText = 'NFT minted successfully!';
        })
        .on('error', error => {
            console.error('Transaction Error:', error);
            document.getElementById('uploadStatus').innerText = `NFT minting failed: ${error.message}`;
        });
}

async function transferOwnership(contract, account, newOwner) {
    const transaction = contract.methods.transferOwnership(newOwner);
    const options = {
        from: account,
        gas: await transaction.estimateGas(),
    };

    transaction.send(options)
        .on('transactionHash', hash => {
            console.log('Transaction Hash:', hash);
        })
        .on('receipt', receipt => {
            console.log('Ownership Transfer Receipt:', receipt);
        })
        .on('error', error => {
            console.error('Transaction Error:', error);
        });
}

async function updateMetadata(contract, account, fileUrl, newMetadata) {
    const transaction = contract.methods.updateMetadata(fileUrl, newMetadata);
    const options = {
        from: account,
        gas: await transaction
async function updateMetadata(contract, account, fileUrl, newMetadata) {
    const transaction = contract.methods.updateMetadata(fileUrl, newMetadata);
    const options = {
        from: account,
        gas: await transaction.estimateGas(),
    };

    transaction.send(options)
        .on('transactionHash', hash => {
            console.log('Transaction Hash:', hash);
        })
        .on('receipt', receipt => {
            console.log('Metadata Update Receipt:', receipt);
        })
        .on('error', error => {
            console.error('Transaction Error:', error);
        });
}

// Example function: burn NFT
async function burnNFT(contract, account, tokenId) {
    const transaction = contract.methods.burn(tokenId);
    const options = {
        from: account,
        gas: await transaction.estimateGas(),
    };

    transaction.send(options)
        .on('transactionHash', hash => {
            console.log('Transaction Hash:', hash);
        })
        .on('receipt', receipt => {
            console.log('NFT Burn Receipt:', receipt);
        })
        .on('error', error => {
            console.error('Transaction Error:', error);
        });
}

// Example function: get NFT details
async function getNFTDetails(contract, tokenId) {
    try {
        const details = await contract.methods.tokenURI(tokenId).call();
        console.log('NFT Details:', details);
        return details;
    } catch (error) {
        console.error('Error fetching NFT details:', error);
    }
}
