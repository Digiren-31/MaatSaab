// Placeholder for Azure Key Vault access via Managed Identity
export async function getSecret(_name: string): Promise<string> {
  // In production, use @azure/identity + @azure/keyvault-secrets
  // Here return a dummy string
  return 'DUMMY';
}
