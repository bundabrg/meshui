import type { ClientInit } from '@sveltejs/kit';
import { mc } from '$lib/meshcentral/meshcentral.svelte';
import { SvelteURL } from 'svelte/reactivity';

export const init: ClientInit = async () => {
    // Temporary till we get to authentication
    const URL = 'fill_with_url';
    const COOKIE =
        'fill_with_cookie';

    const RCOOKIE =
        'fill_with_rcookie';

    mc.connect({
        url: new SvelteURL(URL),
        authCookie: COOKIE,
        authRelayCookie: RCOOKIE,
        domainUrl: '/',
    });
};
