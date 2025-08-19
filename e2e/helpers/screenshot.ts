import * as fs from 'node:fs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function takeScreenshotOnFailure(context: any) {
  context.onTestFailed(async () => {
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
      console.log(`Folder screenshots created.`);
    }
    const normalizedFilePath = context.task.name
      .replace(/'/g, '')
      .replace(/"/g, '')
      .replace(/=/g, '')
      .replace(/\//g, '_')
      .replace(/:/g, '_')
      .replace(/ /g, '_');
    let fileName = `${normalizedFilePath}_failure`;
    let counter = 0;
    while (fs.existsSync(`screenshots/${fileName}.png`)) {
      counter += 1;
      fileName = `${fileName}_${counter}`;
      if (counter > 10) break;
    }
    console.log(`Screenshot of the failed test will be saved to: ${fileName}`);
    try {
      const image = await context.driver.takeScreenshot();
      fs.writeFileSync(`screenshots/${fileName}.png`, image, 'base64');
    } catch (error) {
      console.error('Error occurred while taking screenshot:', error);
    }
  });
}
