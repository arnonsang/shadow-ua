import { Browser, Platform } from '../types';

export interface TLSFingerprint {
  version: string;
  cipherSuites: string[];
  extensions: TLSExtension[];
  ellipticCurves: string[];
  signatureAlgorithms: string[];
  supportedVersions: string[];
  keyShare: string[];
  applicationLayerProtocolNegotiation: string[];
}

export interface TLSExtension {
  type: number;
  name: string;
  data?: string;
}

export interface TLSConfig {
  minVersion: string;
  maxVersion: string;
  preferredCiphers: string[];
  secureRenegotiation: boolean;
  sessionTickets: boolean;
  ocspStapling: boolean;
  sni: boolean;
}

// Real TLS fingerprints based on browser implementations
const TLS_FINGERPRINTS = {
  [Browser.Chrome]: {
    [Platform.Windows]: {
      version: 'TLSv1.3',
      cipherSuites: [
        'TLS_AES_128_GCM_SHA256',
        'TLS_AES_256_GCM_SHA384',
        'TLS_CHACHA20_POLY1305_SHA256',
        'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
        'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
        'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
        'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
        'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
        'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256',
        'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA',
        'TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA',
        'TLS_RSA_WITH_AES_128_GCM_SHA256',
        'TLS_RSA_WITH_AES_256_GCM_SHA384',
        'TLS_RSA_WITH_AES_128_CBC_SHA',
        'TLS_RSA_WITH_AES_256_CBC_SHA'
      ],
      extensions: [
        { type: 0, name: 'server_name' },
        { type: 23, name: 'session_ticket' },
        { type: 65281, name: 'renegotiation_info' },
        { type: 10, name: 'supported_groups' },
        { type: 11, name: 'ec_point_formats' },
        { type: 35, name: 'session_ticket_tls' },
        { type: 16, name: 'application_layer_protocol_negotiation' },
        { type: 5, name: 'status_request' },
        { type: 13, name: 'signature_algorithms' },
        { type: 43, name: 'supported_versions' },
        { type: 44, name: 'cookie' },
        { type: 51, name: 'key_share' },
        { type: 21, name: 'padding' }
      ],
      ellipticCurves: ['X25519', 'secp256r1', 'secp384r1'],
      signatureAlgorithms: [
        'ecdsa_secp256r1_sha256',
        'rsa_pss_rsae_sha256',
        'rsa_pkcs1_sha256',
        'ecdsa_secp384r1_sha384',
        'rsa_pss_rsae_sha384',
        'rsa_pkcs1_sha384',
        'rsa_pss_rsae_sha512',
        'rsa_pkcs1_sha512'
      ],
      supportedVersions: ['TLSv1.3', 'TLSv1.2'],
      keyShare: ['X25519', 'secp256r1'],
      applicationLayerProtocolNegotiation: ['h2', 'http/1.1']
    },
    [Platform.macOS]: {
      version: 'TLSv1.3',
      cipherSuites: [
        'TLS_AES_128_GCM_SHA256',
        'TLS_AES_256_GCM_SHA384',
        'TLS_CHACHA20_POLY1305_SHA256',
        'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
        'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
        'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
        'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
        'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
        'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256'
      ],
      extensions: [
        { type: 0, name: 'server_name' },
        { type: 23, name: 'session_ticket' },
        { type: 65281, name: 'renegotiation_info' },
        { type: 10, name: 'supported_groups' },
        { type: 11, name: 'ec_point_formats' },
        { type: 16, name: 'application_layer_protocol_negotiation' },
        { type: 5, name: 'status_request' },
        { type: 13, name: 'signature_algorithms' },
        { type: 43, name: 'supported_versions' },
        { type: 51, name: 'key_share' }
      ],
      ellipticCurves: ['X25519', 'secp256r1', 'secp384r1'],
      signatureAlgorithms: [
        'ecdsa_secp256r1_sha256',
        'rsa_pss_rsae_sha256',
        'rsa_pkcs1_sha256',
        'ecdsa_secp384r1_sha384',
        'rsa_pss_rsae_sha384',
        'rsa_pkcs1_sha384'
      ],
      supportedVersions: ['TLSv1.3', 'TLSv1.2'],
      keyShare: ['X25519', 'secp256r1'],
      applicationLayerProtocolNegotiation: ['h2', 'http/1.1']
    },
    [Platform.Linux]: {
      version: 'TLSv1.3',
      cipherSuites: [
        'TLS_AES_128_GCM_SHA256',
        'TLS_AES_256_GCM_SHA384',
        'TLS_CHACHA20_POLY1305_SHA256',
        'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
        'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
        'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
        'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
        'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
        'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256'
      ],
      extensions: [
        { type: 0, name: 'server_name' },
        { type: 23, name: 'session_ticket' },
        { type: 65281, name: 'renegotiation_info' },
        { type: 10, name: 'supported_groups' },
        { type: 11, name: 'ec_point_formats' },
        { type: 16, name: 'application_layer_protocol_negotiation' },
        { type: 5, name: 'status_request' },
        { type: 13, name: 'signature_algorithms' },
        { type: 43, name: 'supported_versions' },
        { type: 51, name: 'key_share' },
        { type: 18, name: 'signed_certificate_timestamp' }
      ],
      ellipticCurves: ['X25519', 'secp256r1', 'secp384r1'],
      signatureAlgorithms: [
        'ecdsa_secp256r1_sha256',
        'rsa_pss_rsae_sha256',
        'rsa_pkcs1_sha256',
        'ecdsa_secp384r1_sha384',
        'rsa_pss_rsae_sha384',
        'rsa_pkcs1_sha384'
      ],
      supportedVersions: ['TLSv1.3', 'TLSv1.2'],
      keyShare: ['X25519', 'secp256r1'],
      applicationLayerProtocolNegotiation: ['h2', 'http/1.1']
    }
  },
  [Browser.Firefox]: {
    [Platform.Windows]: {
      version: 'TLSv1.3',
      cipherSuites: [
        'TLS_AES_128_GCM_SHA256',
        'TLS_CHACHA20_POLY1305_SHA256',
        'TLS_AES_256_GCM_SHA384',
        'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
        'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
        'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
        'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256',
        'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
        'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
        'TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA',
        'TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA',
        'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA',
        'TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA'
      ],
      extensions: [
        { type: 0, name: 'server_name' },
        { type: 23, name: 'session_ticket' },
        { type: 10, name: 'supported_groups' },
        { type: 11, name: 'ec_point_formats' },
        { type: 13, name: 'signature_algorithms' },
        { type: 16, name: 'application_layer_protocol_negotiation' },
        { type: 5, name: 'status_request' },
        { type: 51, name: 'key_share' },
        { type: 43, name: 'supported_versions' },
        { type: 65281, name: 'renegotiation_info' }
      ],
      ellipticCurves: ['X25519', 'secp256r1', 'secp384r1', 'secp521r1'],
      signatureAlgorithms: [
        'ecdsa_secp256r1_sha256',
        'ecdsa_secp384r1_sha384',
        'ecdsa_secp521r1_sha512',
        'rsa_pss_rsae_sha256',
        'rsa_pss_rsae_sha384',
        'rsa_pss_rsae_sha512',
        'rsa_pkcs1_sha256',
        'rsa_pkcs1_sha384',
        'rsa_pkcs1_sha512'
      ],
      supportedVersions: ['TLSv1.3', 'TLSv1.2'],
      keyShare: ['X25519'],
      applicationLayerProtocolNegotiation: ['h2', 'http/1.1']
    },
    [Platform.macOS]: {
      version: 'TLSv1.3',
      cipherSuites: [
        'TLS_AES_128_GCM_SHA256',
        'TLS_CHACHA20_POLY1305_SHA256',
        'TLS_AES_256_GCM_SHA384',
        'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
        'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
        'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
        'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256',
        'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
        'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384'
      ],
      extensions: [
        { type: 0, name: 'server_name' },
        { type: 23, name: 'session_ticket' },
        { type: 10, name: 'supported_groups' },
        { type: 11, name: 'ec_point_formats' },
        { type: 13, name: 'signature_algorithms' },
        { type: 16, name: 'application_layer_protocol_negotiation' },
        { type: 5, name: 'status_request' },
        { type: 51, name: 'key_share' },
        { type: 43, name: 'supported_versions' },
        { type: 65281, name: 'renegotiation_info' }
      ],
      ellipticCurves: ['X25519', 'secp256r1', 'secp384r1', 'secp521r1'],
      signatureAlgorithms: [
        'ecdsa_secp256r1_sha256',
        'ecdsa_secp384r1_sha384',
        'ecdsa_secp521r1_sha512',
        'rsa_pss_rsae_sha256',
        'rsa_pss_rsae_sha384',
        'rsa_pss_rsae_sha512'
      ],
      supportedVersions: ['TLSv1.3', 'TLSv1.2'],
      keyShare: ['X25519'],
      applicationLayerProtocolNegotiation: ['h2', 'http/1.1']
    },
    [Platform.Linux]: {
      version: 'TLSv1.3',
      cipherSuites: [
        'TLS_AES_128_GCM_SHA256',
        'TLS_CHACHA20_POLY1305_SHA256',
        'TLS_AES_256_GCM_SHA384',
        'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
        'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
        'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
        'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256',
        'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
        'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384'
      ],
      extensions: [
        { type: 0, name: 'server_name' },
        { type: 23, name: 'session_ticket' },
        { type: 10, name: 'supported_groups' },
        { type: 11, name: 'ec_point_formats' },
        { type: 13, name: 'signature_algorithms' },
        { type: 16, name: 'application_layer_protocol_negotiation' },
        { type: 5, name: 'status_request' },
        { type: 51, name: 'key_share' },
        { type: 43, name: 'supported_versions' },
        { type: 65281, name: 'renegotiation_info' }
      ],
      ellipticCurves: ['X25519', 'secp256r1', 'secp384r1', 'secp521r1'],
      signatureAlgorithms: [
        'ecdsa_secp256r1_sha256',
        'ecdsa_secp384r1_sha384',
        'ecdsa_secp521r1_sha512',
        'rsa_pss_rsae_sha256',
        'rsa_pss_rsae_sha384',
        'rsa_pss_rsae_sha512'
      ],
      supportedVersions: ['TLSv1.3', 'TLSv1.2'],
      keyShare: ['X25519'],
      applicationLayerProtocolNegotiation: ['h2', 'http/1.1']
    }
  },
  [Browser.Safari]: {
    [Platform.macOS]: {
      version: 'TLSv1.3',
      cipherSuites: [
        'TLS_AES_128_GCM_SHA256',
        'TLS_AES_256_GCM_SHA384',
        'TLS_CHACHA20_POLY1305_SHA256',
        'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
        'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
        'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
        'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
        'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
        'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256'
      ],
      extensions: [
        { type: 0, name: 'server_name' },
        { type: 10, name: 'supported_groups' },
        { type: 11, name: 'ec_point_formats' },
        { type: 13, name: 'signature_algorithms' },
        { type: 16, name: 'application_layer_protocol_negotiation' },
        { type: 23, name: 'session_ticket' },
        { type: 43, name: 'supported_versions' },
        { type: 51, name: 'key_share' },
        { type: 65281, name: 'renegotiation_info' }
      ],
      ellipticCurves: ['X25519', 'secp256r1', 'secp384r1'],
      signatureAlgorithms: [
        'ecdsa_secp256r1_sha256',
        'ecdsa_secp384r1_sha384',
        'rsa_pss_rsae_sha256',
        'rsa_pss_rsae_sha384',
        'rsa_pkcs1_sha256',
        'rsa_pkcs1_sha384'
      ],
      supportedVersions: ['TLSv1.3', 'TLSv1.2'],
      keyShare: ['X25519', 'secp256r1'],
      applicationLayerProtocolNegotiation: ['h2', 'http/1.1']
    },
    [Platform.iOS]: {
      version: 'TLSv1.3',
      cipherSuites: [
        'TLS_AES_128_GCM_SHA256',
        'TLS_AES_256_GCM_SHA384',
        'TLS_CHACHA20_POLY1305_SHA256',
        'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
        'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
        'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
        'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256'
      ],
      extensions: [
        { type: 0, name: 'server_name' },
        { type: 10, name: 'supported_groups' },
        { type: 11, name: 'ec_point_formats' },
        { type: 13, name: 'signature_algorithms' },
        { type: 16, name: 'application_layer_protocol_negotiation' },
        { type: 23, name: 'session_ticket' },
        { type: 43, name: 'supported_versions' },
        { type: 51, name: 'key_share' }
      ],
      ellipticCurves: ['X25519', 'secp256r1', 'secp384r1'],
      signatureAlgorithms: [
        'ecdsa_secp256r1_sha256',
        'ecdsa_secp384r1_sha384',
        'rsa_pss_rsae_sha256',
        'rsa_pss_rsae_sha384'
      ],
      supportedVersions: ['TLSv1.3', 'TLSv1.2'],
      keyShare: ['X25519'],
      applicationLayerProtocolNegotiation: ['h2', 'http/1.1']
    }
  },
  [Browser.Edge]: {
    [Platform.Windows]: {
      version: 'TLSv1.3',
      cipherSuites: [
        'TLS_AES_128_GCM_SHA256',
        'TLS_AES_256_GCM_SHA384',
        'TLS_CHACHA20_POLY1305_SHA256',
        'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
        'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
        'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
        'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
        'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
        'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256'
      ],
      extensions: [
        { type: 0, name: 'server_name' },
        { type: 23, name: 'session_ticket' },
        { type: 65281, name: 'renegotiation_info' },
        { type: 10, name: 'supported_groups' },
        { type: 11, name: 'ec_point_formats' },
        { type: 35, name: 'session_ticket_tls' },
        { type: 16, name: 'application_layer_protocol_negotiation' },
        { type: 5, name: 'status_request' },
        { type: 13, name: 'signature_algorithms' },
        { type: 43, name: 'supported_versions' },
        { type: 51, name: 'key_share' }
      ],
      ellipticCurves: ['X25519', 'secp256r1', 'secp384r1'],
      signatureAlgorithms: [
        'ecdsa_secp256r1_sha256',
        'rsa_pss_rsae_sha256',
        'rsa_pkcs1_sha256',
        'ecdsa_secp384r1_sha384',
        'rsa_pss_rsae_sha384',
        'rsa_pkcs1_sha384'
      ],
      supportedVersions: ['TLSv1.3', 'TLSv1.2'],
      keyShare: ['X25519', 'secp256r1'],
      applicationLayerProtocolNegotiation: ['h2', 'http/1.1']
    }
  }
};

/**
 * Generate TLS fingerprint for a specific browser and platform
 */
export function generateTLSFingerprint(browser: Browser, platform: Platform): TLSFingerprint {
  const browserFingerprints = TLS_FINGERPRINTS[browser];
  if (!browserFingerprints) {
    throw new Error(`TLS fingerprints not available for browser: ${browser}`);
  }
  
  const platformFingerprint = (browserFingerprints as any)[platform];
  if (!platformFingerprint) {
    // Fallback to first available platform for the browser
    const availablePlatforms = Object.keys(browserFingerprints);
    const fallbackPlatform = availablePlatforms[0] as Platform;
    return (browserFingerprints as any)[fallbackPlatform] as TLSFingerprint;
  }
  
  // Add some variation to make fingerprints unique
  const fingerprint = { ...platformFingerprint } as TLSFingerprint;
  
  // Randomly shuffle cipher suite order slightly (browsers do this)
  if (Math.random() > 0.8) {
    const ciphers = [...fingerprint.cipherSuites];
    const index1 = Math.floor(Math.random() * Math.min(3, ciphers.length));
    const index2 = Math.floor(Math.random() * Math.min(3, ciphers.length));
    [ciphers[index1], ciphers[index2]] = [ciphers[index2], ciphers[index1]];
    fingerprint.cipherSuites = ciphers;
  }
  
  return fingerprint;
}

/**
 * Generate TLS configuration for HTTP clients
 */
export function generateTLSConfig(browser: Browser, platform: Platform): TLSConfig {
  const fingerprint = generateTLSFingerprint(browser, platform);
  
  return {
    minVersion: 'TLSv1.2',
    maxVersion: fingerprint.version,
    preferredCiphers: fingerprint.cipherSuites.slice(0, 10), // Top 10 preferred
    secureRenegotiation: true,
    sessionTickets: fingerprint.extensions.some(ext => ext.name === 'session_ticket'),
    ocspStapling: fingerprint.extensions.some(ext => ext.name === 'status_request'),
    sni: fingerprint.extensions.some(ext => ext.name === 'server_name'),
  };
}

/**
 * Generate Node.js HTTPS agent configuration with TLS fingerprinting
 */
export function generateHTTPSAgentConfig(browser: Browser, platform: Platform): {
  secureProtocol: string;
  ciphers: string;
  honorCipherOrder: boolean;
  secureOptions: number;
  rejectUnauthorized: boolean;
  checkServerIdentity?: (hostname: string, cert: any) => Error | undefined;
} {
  const fingerprint = generateTLSFingerprint(browser, platform);
  
  // Convert cipher suites to OpenSSL format
  const opensslCiphers = fingerprint.cipherSuites
    .map(cipher => convertToOpenSSLCipher(cipher))
    .filter(Boolean)
    .join(':');
  
  return {
    secureProtocol: 'TLSv1_2_method',
    ciphers: opensslCiphers,
    honorCipherOrder: true,
    secureOptions: 0, // No SSL options restrictions
    rejectUnauthorized: true,
    checkServerIdentity: (hostname: string, cert: any) => {
      // Custom server identity check to mimic browser behavior
      if (!cert.subject) {
        return new Error('Certificate subject is missing');
      }
      
      // Basic hostname verification (browsers do more complex checks)
      const certHostname = cert.subject.CN || cert.subject.commonName;
      if (certHostname && hostname !== certHostname && !hostname.endsWith('.' + certHostname)) {
        // Allow wildcard matching
        if (!certHostname.startsWith('*.') || !hostname.endsWith(certHostname.slice(2))) {
          return new Error('Hostname/certificate mismatch');
        }
      }
      
      return undefined;
    }
  };
}

/**
 * Convert TLS cipher suite name to OpenSSL format
 */
function convertToOpenSSLCipher(tlsCipher: string): string | null {
  const cipherMap: { [key: string]: string } = {
    'TLS_AES_128_GCM_SHA256': 'TLS_AES_128_GCM_SHA256',
    'TLS_AES_256_GCM_SHA384': 'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256': 'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256': 'ECDHE-ECDSA-AES128-GCM-SHA256',
    'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256': 'ECDHE-RSA-AES128-GCM-SHA256',
    'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384': 'ECDHE-ECDSA-AES256-GCM-SHA384',
    'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384': 'ECDHE-RSA-AES256-GCM-SHA384',
    'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256': 'ECDHE-ECDSA-CHACHA20-POLY1305',
    'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256': 'ECDHE-RSA-CHACHA20-POLY1305',
    'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA': 'ECDHE-RSA-AES128-SHA',
    'TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA': 'ECDHE-RSA-AES256-SHA',
    'TLS_RSA_WITH_AES_128_GCM_SHA256': 'AES128-GCM-SHA256',
    'TLS_RSA_WITH_AES_256_GCM_SHA384': 'AES256-GCM-SHA384',
    'TLS_RSA_WITH_AES_128_CBC_SHA': 'AES128-SHA',
    'TLS_RSA_WITH_AES_256_CBC_SHA': 'AES256-SHA'
  };
  
  return cipherMap[tlsCipher] || null;
}

/**
 * Generate curl command with TLS fingerprinting
 */
export function generateCurlWithTLS(
  url: string, 
  browser: Browser, 
  platform: Platform, 
  userAgent: string,
  additionalOptions: string[] = []
): string {
  const tlsConfig = generateTLSConfig(browser, platform);
  const fingerprint = generateTLSFingerprint(browser, platform);
  
  const options = [
    `--user-agent "${userAgent}"`,
    `--tlsv1.2`, // Minimum TLS version
    `--tls-max 1.3`, // Maximum TLS version
    `--ciphers "${fingerprint.cipherSuites.slice(0, 5).join(':')}"`,
    `--compressed`,
    `--http2`, // Enable HTTP/2 if supported
    ...additionalOptions
  ];
  
  return `curl ${options.join(' ')} "${url}"`;
}

/**
 * Generate Python requests session with TLS fingerprinting
 */
export function generatePythonRequestsConfig(browser: Browser, platform: Platform, userAgent: string): string {
  const fingerprint = generateTLSFingerprint(browser, platform);
  
  return `
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.ssl_ import create_urllib3_context
import ssl

class TLSAdapter(HTTPAdapter):
    def init_poolmanager_ctx(self, *args, **kwargs):
        ctx = create_urllib3_context()
        ctx.set_ciphers('${fingerprint.cipherSuites.slice(0, 8).join(':')}')
        ctx.options |= 0x4  # OP_LEGACY_SERVER_CONNECT
        ctx.minimum_version = ssl.TLSVersion.TLSv1_2
        ctx.maximum_version = ssl.TLSVersion.TLSv1_3
        kwargs['ssl_context'] = ctx
        return super().init_poolmanager_ctx(*args, **kwargs)

session = requests.Session()
session.mount('https://', TLSAdapter())
session.headers.update({
    'User-Agent': '${userAgent}',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
})
`.trim();
}

/**
 * Analyze TLS fingerprint compatibility
 */
export function analyzeTLSCompatibility(fingerprint: TLSFingerprint): {
  modernCompliance: boolean;
  securityScore: number;
  warnings: string[];
  recommendations: string[];
} {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let securityScore = 100;
  
  // Check for weak cipher suites
  const weakCiphers = fingerprint.cipherSuites.filter(cipher => 
    cipher.includes('CBC') || cipher.includes('RSA_WITH_AES')
  );
  
  if (weakCiphers.length > 0) {
    securityScore -= 20;
    warnings.push(`Weak cipher suites detected: ${weakCiphers.join(', ')}`);
    recommendations.push('Remove weak CBC and RSA-only cipher suites');
  }
  
  // Check TLS version support
  if (!fingerprint.supportedVersions.includes('TLSv1.3')) {
    securityScore -= 10;
    warnings.push('TLS 1.3 not supported');
    recommendations.push('Add TLS 1.3 support for improved security');
  }
  
  // Check for modern extensions
  const modernExtensions = ['supported_versions', 'key_share', 'signature_algorithms'];
  const missingExtensions = modernExtensions.filter(ext => 
    !fingerprint.extensions.some(e => e.name === ext)
  );
  
  if (missingExtensions.length > 0) {
    securityScore -= 15;
    warnings.push(`Missing modern extensions: ${missingExtensions.join(', ')}`);
    recommendations.push('Add modern TLS extensions for better compatibility');
  }
  
  const modernCompliance = securityScore >= 80;
  
  return {
    modernCompliance,
    securityScore: Math.max(0, securityScore),
    warnings,
    recommendations
  };
}