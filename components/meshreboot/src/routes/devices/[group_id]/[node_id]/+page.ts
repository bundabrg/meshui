import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

export const load: PageLoad = async ({ params, parent }) => {
    const { mesh } = await parent();

    if (!(params.node_id in mesh().nodes)) {
        redirect(301, resolve('/devices/[group_id]', { group_id: params.group_id }));
    }

    const node = mesh().nodes[params.node_id];
    await node.load();

    return {
        node: () => node,
    };
};
