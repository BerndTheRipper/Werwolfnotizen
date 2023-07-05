const timeout = 5000;

var page;
beforeAll(async () => {
    page = await globalThis.__BROWSER_GLOBAL__.newPage();
    await page.goto('http://localhost:8000');
}, timeout);

describe(
    'Initial View loading properly',
    () => {
        it('should load without error', async () => {
            const text = await page.evaluate(() => document.body.textContent);
            const model = await page.evaluate(()=> model)
            expect(text).toContain('Notiz an mich:');
            expect(typeof model).toBe("object");
        });
    },
    timeout,
);