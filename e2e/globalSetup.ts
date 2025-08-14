import { execSync } from 'child_process';
import path from 'path';

export async function setup() {
  console.log('🔧 Running E2E global setup...');

  try {
    // Generate mock files before running tests
    console.log('📝 Generating mock files...');
    const scriptPath = path.join(__dirname, 'generateUserAssetMocks.ts');
    execSync(`npx tsx ${scriptPath}`, {
      stdio: 'inherit',
      cwd: path.dirname(__dirname),
    });
    console.log('✅ Mock files generated successfully');
  } catch (error) {
    console.error('❌ Failed to generate mock files:', error);
    throw error;
  }
}

export async function teardown() {
  console.log('🧹 E2E tests completed');
}
