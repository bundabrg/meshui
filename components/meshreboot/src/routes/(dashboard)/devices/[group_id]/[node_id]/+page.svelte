<script lang="ts">
    import {goto} from "$app/navigation";
    import {resolve} from "$app/paths";
    import {mc} from "$lib/meshcentral/meshcentral.svelte";
    import {page} from "$app/state";

    let {data} = $props();
    const mesh = $derived(mc.loaded && page.params.group_id?mc.meshes[page.params.group_id]:null);
    const node = $derived(mesh && page.params.node_id?mesh.nodes[page.params.node_id]:null);

    $effect(() => {
        // If node is deleted or invalid then redirect
        if (mc.loaded) {
            if (node) {
                node.load();
            }

            if (!node || !mesh || !(node.current._id in mesh.nodes)) {
                goto(resolve('/devices/[group_id]', {group_id: encodeURIComponent(page.params.group_id)}));
            }
        }
        return () => {
            console.log("Hiding Node");
            node?.hide();
        }
    });

    let streaming = false;

</script>

<div
        class="flex min-w-[380px] flex-col items-center justify-center border-e border-e-slate-300 p-3"
>
    {#if node?.loaded}
    {node.current.name}
    <canvas
            id="kvm1"
            width="640"
            height="480"
            style="background-color:black;width:320px;height:240px"
    >
    </canvas>
    <a target="_blank"
       href="{resolve('/view/[group_id]/[node_id]', {group_id: encodeURIComponent(mesh.current._id), node_id: encodeURIComponent(node.current._id)})}">Full
        Screen</a>
    <button onclick={() => { streaming?node.hide():node.show('kvm1');streaming = !streaming; }}>click me</button>
    {:else}
        <div
                class="flex flex-col m-auto items-center justify-center"
        >
            Loading
        </div>
    {/if}
</div>
