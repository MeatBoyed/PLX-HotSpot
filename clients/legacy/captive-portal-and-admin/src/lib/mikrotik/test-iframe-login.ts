// Test file to verify the iframe-based login implementation
import { clientLoginToHotspot } from './mikrotik-client';

// This is a test function - not meant to be used in production
export async function testIframeLogin() {
    console.log('Testing iframe-based login...');

    // Test with a sample voucher code
    const result = await clientLoginToHotspot('test-voucher');

    console.log('Login result:', result);

    return result;
}

// Note: This test would only work in a browser environment with proper MikroTik data
console.log('Iframe login implementation loaded successfully');
