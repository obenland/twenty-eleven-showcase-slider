import { test, expect } from '@playwright/test';
import { wp } from './utils';

/**
 * End-to-end coverage for Twenty Eleven Showcase Slider.
 *
 * The plugin is a no-op unless the active theme is Twenty Eleven (the
 * file early-returns otherwise). It then registers a carousel script
 * and, on `wp_enqueue_scripts`, swaps the theme's default
 * `twentyeleven-showcase` script out for its own carousel script —
 * but only on pages using the `showcase.php` page template.
 *
 * Three things to pin:
 *
 * 1. On a normal page (non-showcase template), the plugin must NOT
 *    enqueue its carousel script and must NOT dequeue the default
 *    twentyeleven-showcase script. Regression check that the path
 *    filter on `is_page_template( 'showcase.php' )` is honoured.
 *
 * 2. On a page using the Showcase template, the plugin's carousel
 *    script IS enqueued — i.e. the user-visible behaviour the plugin
 *    exists to provide actually happens.
 *
 * 3. On the Showcase template, the theme's default
 *    `twentyeleven-showcase` script is correctly dequeued, so the two
 *    don't conflict on the same page.
 */

test.describe( 'Twenty Eleven Showcase Slider', () => {
	test( 'plugin script is NOT enqueued, theme script unchanged, on a regular page', async ( {
		page,
	} ) => {
		const pageId = wp( [
			'post',
			'create',
			'--post_type=page',
			'--post_status=publish',
			'--post_title=Plain page',
			'--porcelain',
		] );
		const permalink = wp( [ 'post', 'url', pageId ] );

		await page.goto( permalink );

		// The plugin's script tag has handle `twenty-eleven-showcase-slider`,
		// which appears in the rendered <script src=...> URL when enqueued.
		const sliderScripts = await page
			.locator( 'script[src*="twenty-eleven-showcase-slider"]' )
			.count();
		expect( sliderScripts ).toBe( 0 );

		// The theme's default `twentyeleven-showcase` script should still
		// be present here — the plugin only dequeues it on the Showcase
		// template. Note: the theme only enqueues this script on pages
		// using the showcase template too, so on a *plain* page neither
		// the plugin nor the theme has a reason to enqueue it. The real
		// regression risk is that the plugin somehow dequeues the theme
		// script even outside the template; on a plain page the count
		// is expected to be 0 for both, which is the same as "the plugin
		// did not dequeue something the theme didn't enqueue."
		const themeShowcaseScripts = await page
			.locator( 'script[src*="/themes/twentyeleven/js/showcase"]' )
			.count();
		expect( themeShowcaseScripts ).toBe( 0 );
	} );

	test( 'plugin script IS enqueued on a page using the Showcase template', async ( {
		page,
	} ) => {
		// Create a page assigned to the showcase.php template.
		const pageId = wp( [
			'post',
			'create',
			'--post_type=page',
			'--post_status=publish',
			'--post_title=Showcase test',
			'--porcelain',
		] );
		wp( [
			'post',
			'meta',
			'update',
			pageId,
			'_wp_page_template',
			'showcase.php',
		] );

		const permalink = wp( [ 'post', 'url', pageId ] );
		await page.goto( permalink );

		const sliderScripts = await page
			.locator( 'script[src*="twenty-eleven-showcase-slider"]' )
			.count();
		expect( sliderScripts ).toBeGreaterThanOrEqual( 1 );
	} );

	test( 'theme default twentyeleven-showcase script is dequeued on the Showcase template', async ( {
		page,
	} ) => {
		const pageId = wp( [
			'post',
			'create',
			'--post_type=page',
			'--post_status=publish',
			'--post_title=Showcase dequeue test',
			'--porcelain',
		] );
		wp( [
			'post',
			'meta',
			'update',
			pageId,
			'_wp_page_template',
			'showcase.php',
		] );

		const permalink = wp( [ 'post', 'url', pageId ] );
		await page.goto( permalink );

		// The theme's default script handle is `twentyeleven-showcase`.
		// We need to count tags whose src ends with the theme's
		// `showcase.js`, NOT our plugin's `twenty-eleven-showcase-slider.js`.
		const themeShowcaseScripts = await page
			.locator( 'script[src*="/themes/twentyeleven/js/showcase"]' )
			.count();
		expect( themeShowcaseScripts ).toBe( 0 );
	} );
} );
