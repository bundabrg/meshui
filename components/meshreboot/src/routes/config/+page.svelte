<script lang="ts">
    import { mc } from '$lib/meshcentral.svelte';
</script>

Confug: {mc.serverInfo?.name} - {mc.userInfo?.name} --> {mc.userInfo?._id}

{#each mc.meshes as mesh (mesh._id)}
    {mesh.name}
{/each}
