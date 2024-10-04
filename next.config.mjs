/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
              protocol: 'https',
              hostname: 'v5.airtableusercontent.com',
              port: '',
            },
            {
              protocol: 'https',
              hostname: 'firebasestorage.googleapis.com',
              port: '',
            },
        ],
    },
};

export default nextConfig;
