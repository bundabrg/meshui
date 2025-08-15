import type { PageLoad } from './$types';
import { mc } from '$lib/meshcentral.svelte';

export const load: PageLoad = ({ params }) => {
	mc.send({
		action: "nodes",
		"meshid": `mesh//${params.group_id}`,
		"skip": 0
	});

	return {

	}
}