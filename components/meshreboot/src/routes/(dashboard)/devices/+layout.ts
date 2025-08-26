import type { LayoutLoad } from './$types';
import { mc } from '$lib/meshcentral/meshcentral.svelte.js';

export const load: LayoutLoad = async () => {
    mc.load();

    // return {
    //     meshes: () => mc.meshes,
    // };
};
