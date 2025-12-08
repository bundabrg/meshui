import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { mc } from '$lib/meshcentral/meshcentral.svelte';

export const load: LayoutLoad = async ({ params, parent }) => {
    // const { meshes } = await parent();
    //
    // if (!(params.group_id in meshes())) {
    //     redirect(301, resolve('/devices'));
    // }
    //
    // const mesh = meshes()[params.group_id];
    // await mesh.load();
    //
    // return {
    //     mesh: () => mesh,
    // };

    // If we can, try to pre-load nodes
    if (mc.loaded) {
        const mesh = mc.meshes[params.group_id];
        mesh?.load();
    }
};
