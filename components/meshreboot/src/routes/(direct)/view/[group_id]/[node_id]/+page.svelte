<script lang="ts">
    let {data} = $props();
    const node = $derived(data.node());

    $effect(() => {
        node.show('kvm1')
    });
</script>

<div class="flex h-screen flex-col font-primary lg:flex-row">
    <canvas
            id="kvm1"
            class="h-full w-full bg-black"
    >
    </canvas>
</div>
