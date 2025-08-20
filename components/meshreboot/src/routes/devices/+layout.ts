import type { LayoutLoad } from './$types';
import { mc } from '$lib/meshcentral/meshcentral.svelte';

export const load: LayoutLoad = async () => {
    // Wait for Meshes to load
    await mc.load();

    return {
        meshes: () => mc.meshes
    }
};
