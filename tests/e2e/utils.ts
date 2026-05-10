import { execFileSync } from 'node:child_process';

/**
 * Runs a wp-cli command inside the wp-env container, returning its stdout.
 *
 * Each argument is passed through individually (no shell interpolation),
 * so titles / paths with spaces or quotes don't need escaping and an
 * unsanitised value can't smuggle additional shell commands.
 *
 * @param args Arguments to append after `wp` in the container.
 */
export function wp( args: string[] ): string {
	return execFileSync(
		'npx',
		[ '--no-install', 'wp-env', 'run', 'cli', 'wp', ...args ],
		{
			stdio: [ 'ignore', 'pipe', 'inherit' ],
			cwd: process.cwd(),
		}
	)
		.toString()
		.trim();
}
