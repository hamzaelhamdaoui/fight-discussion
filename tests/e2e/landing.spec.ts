import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("should display the landing page correctly", async ({ page }) => {
    await page.goto("/");

    // Check hero section
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Turn Your Arguments Into"
    );
    await expect(page.getByText("Epic Battles")).toBeVisible();

    // Check CTA buttons
    await expect(page.getByRole("link", { name: /Start Battle/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Watch Demo/i })).toBeVisible();
  });

  test("should navigate to battle page when clicking Start Battle", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Start Battle/i }).first().click();
    await expect(page).toHaveURL("/battle");
  });

  test("should show feature cards", async ({ page }) => {
    await page.goto("/");

    // Check features are visible
    await expect(page.getByText("Upload Screenshots")).toBeVisible();
    await expect(page.getByText("AI Reconstruction")).toBeVisible();
    await expect(page.getByText("Epic Battle")).toBeVisible();
    await expect(page.getByText("Get Results")).toBeVisible();
  });
});

test.describe("Battle Wizard", () => {
  test("should show upload step initially", async ({ page }) => {
    await page.goto("/battle");

    // Check wizard header
    await expect(page.getByText("Upload Screenshots")).toBeVisible();

    // Check dropzone
    await expect(
      page.getByText(/Tap to select or drag images/i)
    ).toBeVisible();

    // Check continue button is disabled
    const continueButton = page.getByRole("button", {
      name: /Continue to Names/i,
    });
    await expect(continueButton).toBeDisabled();
  });

  test("should show progress steps", async ({ page }) => {
    await page.goto("/battle");

    // Check all step labels
    await expect(page.getByText("Upload")).toBeVisible();
    await expect(page.getByText("Names")).toBeVisible();
    await expect(page.getByText("Review")).toBeVisible();
    await expect(page.getByText("Battle")).toBeVisible();
    await expect(page.getByText("Results")).toBeVisible();
  });
});

test.describe("Mobile Responsiveness", () => {
  test("should be mobile-friendly on landing page", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Check that content is visible and not overflowing
    const heroSection = page.locator("section").first();
    await expect(heroSection).toBeVisible();

    // Check buttons are full width on mobile
    const startButton = page.getByRole("link", { name: /Start Battle/i }).first();
    const buttonBox = await startButton.boundingBox();
    expect(buttonBox?.width).toBeGreaterThan(300);
  });

  test("should have touch-friendly targets", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/battle");

    // Check that main action buttons are at least 44px tall (touch-friendly)
    const continueButton = page.getByRole("button", {
      name: /Continue to Names/i,
    });
    const buttonBox = await continueButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe("Auth Page", () => {
  test("should show login options", async ({ page }) => {
    await page.goto("/auth");

    await expect(page.getByText("Welcome to FightReplay AI")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Continue with Google/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Continue as Guest/i })
    ).toBeVisible();
  });
});
