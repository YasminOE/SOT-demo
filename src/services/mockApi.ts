const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const randomDelay = () => delay(1000 + Math.random() * 2000);

export async function mockSendOTP(_mobile: string): Promise<{ success: boolean }> {
  await randomDelay();
  return { success: true };
}

export async function mockVerifyOTP(_otp: string): Promise<{ success: boolean }> {
  await randomDelay();
  return { success: _otp.length >= 4 };
}

export async function mockNafathVerify(code: string): Promise<{
  success: boolean;
  verifiedName?: string;
}> {
  await randomDelay();
  return { success: code.length === 2, verifiedName: 'Verified via Nafath' };
}

export async function mockWathqLookup(crNumber: string) {
  const { lookupCommercialRegistration } = await import('./wathqMock');
  return lookupCommercialRegistration(crNumber);
}

export async function mockGenerateFO(): Promise<{ success: boolean }> {
  await delay(1500);
  return { success: true };
}

export async function mockEscrowFund(): Promise<{ success: boolean; reference: string }> {
  await randomDelay();
  return { success: true, reference: `DHM-${Date.now()}` };
}

export async function mockEscrowRelease(): Promise<{ success: boolean }> {
  await randomDelay();
  return { success: true };
}

export async function mockEscrowRefund(): Promise<{ success: boolean }> {
  await randomDelay();
  return { success: true };
}

export async function mockMociRequery(): Promise<{ success: boolean; updated: boolean }> {
  await delay(2000);
  return { success: true, updated: true };
}

export async function mockESign(_party: string): Promise<{ success: boolean; timestamp: string }> {
  await randomDelay();
  return { success: true, timestamp: new Date().toISOString() };
}

export { delay, randomDelay };
