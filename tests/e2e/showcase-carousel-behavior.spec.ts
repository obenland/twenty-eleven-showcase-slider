import { test, expect } from '@playwright/test';
import { wp } from './utils';

/**
 * End-to-end coverage for the showcase carousel's runtime behavior.
 *
 * The companion `twenty-eleven-showcase-slider.spec.ts` covers script
 * enqueue/dequeue. This file covers what visitors actually see: a row
 * of sticky featured posts that auto-rotates every 4 seconds, where
 * clicking a slide reveals its featured post, and where the carousel
 * pauses for visitors who prefer reduced motion.
 *
 * Tests in this file share one site setup — five sticky posts, each
 * with a sideloaded featured image, and a Showcase-templated page —
 * created once in beforeAll. They run serially because they mutate
 * shared front-end state (the active slide).
 */

const POST_TITLES = [
	'Quiet Mountains',
	'A City After Rain',
	'Morning at the Harbor',
	'Across the Plains',
	'Light Through the Trees',
];

let showcaseUrl: string;
let stickyIds: string[] = [];
let showcasePageId: string;

/**
 * Provisions a Twenty Eleven showcase site: creates `POST_TITLES.length`
 * sticky posts, sideloads a featured image into each, and creates a
 * page assigned to the `showcase.php` template.
 *
 * Returns the permalink of the showcase page so the test can `page.goto`.
 */
function provisionShowcaseSite(): string {
	stickyIds = POST_TITLES.map( ( title, i ) => {
		const postId = wp( [
			'post',
			'create',
			'--post_type=post',
			'--post_status=publish',
			`--post_title=${ title }`,
			'--porcelain',
		] );

		/*
		 * `wp media import` accepts URLs and `--featured_image` attaches
		 * the result as the post's thumbnail. picsum.photos returns a
		 * stable image per seed, which keeps tests deterministic — but
		 * if the network blips, the post just ends up as a text-only
		 * showcase entry, which is still enough for the carousel tests.
		 */
		try {
			wp( [
				'media',
				'import',
				`https://picsum.photos/seed/showcase-e2e-${ i }/1000/288`,
				`--post_id=${ postId }`,
				'--featured_image',
				'--porcelain',
			] );
		} catch {
			/* Featured image is decorative for these tests. */
		}

		return postId;
	} );

	wp( [
		'option',
		'update',
		'sticky_posts',
		JSON.stringify( stickyIds.map( ( id ) => Number( id ) ) ),
		'--format=json',
	] );

	showcasePageId = wp( [
		'post',
		'create',
		'--post_type=page',
		'--post_status=publish',
		'--post_title=Showcase Behavior',
		'--porcelain',
	] );
	wp( [
		'post',
		'meta',
		'update',
		showcasePageId,
		'_wp_page_template',
		'showcase.php',
	] );

	return wp( [ 'post', 'url', showcasePageId ] );
}

/**
 * Tears down everything provisioned by `provisionShowcaseSite` so the
 * suite leaves no residue behind. Idempotent — safe to call even when
 * some IDs are missing.
 */
function teardownShowcaseSite(): void {
	for ( const postId of stickyIds ) {
		wp( [ 'post', 'delete', postId, '--force' ] );
	}
	if ( showcasePageId ) {
		wp( [ 'post', 'delete', showcasePageId, '--force' ] );
	}
	wp( [ 'option', 'update', 'sticky_posts', '[]', '--format=json' ] );
}

test.describe
	.serial( 'Twenty Eleven Showcase Slider — carousel behavior', () => {
	test.beforeAll( () => {
		showcaseUrl = provisionShowcaseSite();
	} );

	test.afterAll( () => {
		teardownShowcaseSite();
	} );

	test( 'renders a slider with one entry per sticky post', async ( {
		page,
	} ) => {
		await page.goto( showcaseUrl );

		const slides = page.locator( '.feature-slider a' );
		await expect( slides ).toHaveCount( POST_TITLES.length );

		/*
		 * Exactly one slide carries the .active class at any given time.
		 */
		await expect( page.locator( '.feature-slider a.active' ) ).toHaveCount(
			1
		);
	} );

	test( 'auto-advances to the next slide within ~4 seconds', async ( {
		page,
	} ) => {
		await page.goto( showcaseUrl );

		const initiallyActiveHash = await page
			.locator( '.feature-slider a.active' )
			.getAttribute( 'href' );
		expect( initiallyActiveHash ).toBeTruthy();

		/*
		 * The carousel interval is 4000 ms. Give it a generous window
		 * before failing — slow CI machines can lag by a second or two.
		 */
		await expect(
			page.locator( '.feature-slider a.active' )
		).not.toHaveAttribute( 'href', initiallyActiveHash!, {
			timeout: 7_000,
		} );

		/*
		 * Whichever slide is now active, its corresponding featured-post
		 * section must be visible (opacity 1) and all others hidden.
		 */
		const activeHash = await page
			.locator( '.feature-slider a.active' )
			.getAttribute( 'href' );

		await expect( page.locator( activeHash! ) ).toHaveCSS( 'opacity', '1' );
	} );

	test( 'clicking a slide activates it and shows its featured post', async ( {
		page,
	} ) => {
		await page.goto( showcaseUrl );

		const slides = page.locator( '.feature-slider a' );
		const last = slides.nth( POST_TITLES.length - 1 );
		const lastHash = await last.getAttribute( 'href' );

		await last.click();

		await expect( last ).toHaveClass( /(^|\s)active(\s|$)/ );
		await expect( page.locator( lastHash! ) ).toHaveCSS( 'opacity', '1' );

		/*
		 * Other featured-post sections must NOT be the visible one.
		 * Pick another section and assert it's hidden.
		 */
		const firstHash = await slides.nth( 0 ).getAttribute( 'href' );
		await expect( page.locator( firstHash! ) ).toHaveCSS( 'opacity', '0' );
	} );

	test( 'clicking resets the auto-advance timer', async ( { page } ) => {
		await page.goto( showcaseUrl );

		const slides = page.locator( '.feature-slider a' );
		const second = slides.nth( 1 );
		const secondHash = await second.getAttribute( 'href' );

		await second.click();
		await expect( second ).toHaveClass( /(^|\s)active(\s|$)/ );

		/*
		 * 2.5 s after the click is well inside the 4 s window. The
		 * timer reset means the slider must still be on the slide we
		 * clicked — not have advanced from page-load t=0.
		 */
		await page.waitForTimeout( 2_500 );
		const stillActiveHash = await page
			.locator( '.feature-slider a.active' )
			.getAttribute( 'href' );
		expect( stillActiveHash ).toBe( secondHash );
	} );

	test.describe( 'with prefers-reduced-motion', () => {
		test.use( { reducedMotion: 'reduce' } );

		test( 'does NOT auto-advance', async ( { page } ) => {
			await page.goto( showcaseUrl );

			const initiallyActiveHash = await page
				.locator( '.feature-slider a.active' )
				.getAttribute( 'href' );

			/*
			 * Wait well past one carousel interval. The active slide
			 * must not have changed.
			 */
			await page.waitForTimeout( 5_000 );

			const activeHashAfter = await page
				.locator( '.feature-slider a.active' )
				.getAttribute( 'href' );
			expect( activeHashAfter ).toBe( initiallyActiveHash );
		} );
	} );

	test( 'pauses auto-advance when the tab becomes hidden', async ( {
		page,
	} ) => {
		await page.goto( showcaseUrl );

		const initiallyActiveHash = await page
			.locator( '.feature-slider a.active' )
			.getAttribute( 'href' );

		/*
		 * Override document.visibilityState and dispatch the event the
		 * script listens for. This is the same mechanism browsers use
		 * when a tab is backgrounded.
		 */
		await page.evaluate( () => {
			Object.defineProperty( document, 'visibilityState', {
				configurable: true,
				get: () => 'hidden',
			} );
			Object.defineProperty( document, 'hidden', {
				configurable: true,
				get: () => true,
			} );
			document.dispatchEvent( new Event( 'visibilitychange' ) );
		} );

		await page.waitForTimeout( 5_000 );

		const activeHashAfter = await page
			.locator( '.feature-slider a.active' )
			.getAttribute( 'href' );
		expect( activeHashAfter ).toBe( initiallyActiveHash );
	} );
} );
