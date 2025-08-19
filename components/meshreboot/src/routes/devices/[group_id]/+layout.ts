import type { LayoutLoad } from './$types';
import { mc } from '$lib/meshcentral.svelte';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

export const load: LayoutLoad = async ({ params, parent }) => {
	// If the mesh does not exist we will redir to parent
	const { meshes } = await parent();
	if (!(params.group_id in meshes)) {
		console.log(mc.meshes);
		redirect(302, resolve('/devices'));
	}

	mc.refreshNodes(params.group_id);
	return {};
};
