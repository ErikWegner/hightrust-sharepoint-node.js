$publicCertPath = "c:\path\to\file\server.cer"
$certificate = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($publicCertPath)
New-SPTrustedRootAuthority -Name "HighTrustSampleCert ewus.de" -Certificate $certificate
 
$realm = Get-SPAuthenticationRealm
$specificIssuerId = "2a80398d-800e-44b1-ac67-e34b1207114f"
$fullIssuerIdentifier = $specificIssuerId + '@' + $realm
New-SPTrustedSecurityTokenIssuer -Name "High Trust Sample Cert ewus.de" -Certificate $certificate -RegisteredIssuerName $fullIssuerIdentifier –IsTrustBroker
iisreset