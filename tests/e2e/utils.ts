import { execSync } from 'node:child_process';

/**
 * Runs a wp-cli command inside the wp-env container, returning its stdout.
 *
 * @param args Arguments to append after `wp` in the container.
 */
export function wp( args: string ): string {
	return execSync( `npx wp-env run cli wp ${ args }`, {
		stdio: [ 'ignore', 'pipe', 'inherit' ],
		cwd: process.cwd(),
	} )
		.toString()
		.trim();
}
