import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

export const load: LayoutLoad = async ({ params, parent }) => {
    const { meshes } = await parent();

    if (!(params.group_id in meshes())) {
        redirect(301, resolve('/devices'));
    }

    const mesh = meshes()[params.group_id];
    await mesh.load();

    return {
        mesh: () => mesh,
    };
};
