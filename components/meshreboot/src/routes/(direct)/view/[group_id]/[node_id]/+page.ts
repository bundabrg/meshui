import type { PageLoad } from './$types';
import { mc } from '$lib/meshcentral/meshcentral.svelte';

export const load: PageLoad = async ({ params, parent }) => {
    // Wait for Meshes to load
    await mc.load();
    const meshes = mc.meshes;

    if (!(params.group_id in meshes)) {
        window.close();
    }

    const mesh = meshes[params.group_id];

    // Wait for Nodes to load
    await mesh.load();

    if (!(params.node_id in mesh.nodes)) {
        window.close()
    }

    return {
        node: () => mesh.nodes[params.node_id]
    }
};
