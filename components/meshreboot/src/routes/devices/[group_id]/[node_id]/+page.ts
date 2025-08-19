import type { PageLoad } from './$types';
import { mc } from '$lib/meshcentral.svelte';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { goto } from '$app/navigation';

export const load: PageLoad = ({ params }) => {
	// If the node does not exist we will redir to parent
	// if ((params.node_id in mc.nodes)) {
	// 	redirect(302, resolve('/devices/[group_id]', {group_id: encodeURIComponent(params.group_id)}));
	// }

	//mc.refreshNodes(params.group_id);
	return {};
};
