<script lang="ts">
    import {goto} from "$app/navigation";
    import {resolve} from "$app/paths";

    let {data} = $props();
    const node = $derived(data.node());
    const mesh = $derived(data.mesh());

    $effect(() => {
        // If node is deleted then redirect
        if (!(node.current._id in mesh.nodes)) {
            goto(resolve('/devices/[group_id]', {group_id: encodeURIComponent(mesh.current._id)}));
        }
        return () => {
            console.log("Hiding Node");
            node.hide();
        }
    });

    let streaming = false;

</script>

<div
        class="flex min-w-[380px] flex-col items-center justify-center border-e border-e-slate-300 p-3"
>
    {node.current.name}
    <canvas
            id="kvm1"
            width="640"
            height="480"
            style="background-color:black;width:640px;height:480px"
    >
    </canvas>
    <a target="_blank" href="{resolve('/view/[group_id]/[node_id]', {group_id: encodeURIComponent(mesh.current._id), node_id: encodeURIComponent(node.current._id)})}">Full Screen</a>
    <button onclick={() => { streaming?node.hide():node.show('kvm1');streaming = !streaming; }}>click me</button>
</div>
