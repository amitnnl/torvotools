<?php

namespace JWT;

use OpenSSLAsymmetricKey;
use OpenSSLCertificate;

class Key
{
    /**
     * @param string|OpenSSLAsymmetricKey|OpenSSLCertificate $keyMaterial
     * @param string $algorithm
     */
    public function __construct(
        private $keyMaterial,
        private string $algorithm
    ) {
    }

    /**
     * Return the algorithm supported by this key
     *
     * @return string
     */
    public function getAlgorithm(): string
    {
        return $this->algorithm;
    }

    /**
     * @return string|OpenSSLAsymmetricKey|OpenSSLCertificate
     */
    public function getKeyMaterial()
    {
        return $this->keyMaterial;
    }
}
