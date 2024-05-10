import { create } from 'ipfs-http-client';

// Initialize IPFS client
const ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
});

export default ipfs;