import type { ClientInit } from '@sveltejs/kit';
import { mc } from '$lib/meshcentral.svelte';
import { SvelteURL } from 'svelte/reactivity';
import { env } from '$env/dynamic/public';

export const init: ClientInit = async () => {
	// Temporary till we get to authentication
	const URL='fill_with_url';
	const COOKIE='fill_with_cookie';

	mc.connect(new SvelteURL(URL), COOKIE);

}