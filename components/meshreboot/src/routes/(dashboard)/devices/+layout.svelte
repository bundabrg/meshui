<script lang="ts">
    import {resolve} from '$app/paths';
    import {mc} from '$lib/meshcentral/meshcentral.svelte.js';
    import {Input} from "$lib/components/ui/input";
    import * as Resizable from "$lib/components/ui/resizable/index.js";

    let {children} = $props();
    const meshes = $derived(mc.meshes);
</script>



<!--<div class="flex min-w-[380px] flex-col border-e border-e-[var(&#45;&#45;separator-color)] dark:border-e-[var(&#45;&#45;separator-color-dark)] p-3">-->
<Resizable.Pane>
    {#if mc.loaded}
    <div class="flex flex-row justify-between pb-10">
        <h1 class="text-4xl">Groups</h1>
        <span>(Selected Actions)</span>
    </div>
    <div class="flex flex-row items-center gap-2 ps-1">
        <my-button
                type="checkbox"
                class="text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 me-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
        ></my-button>
<!--        <Input type="text" placeholder="Filter">-->
<!--            {#snippet right()}-->
<!--                <CloseButton onclick={() => (value = '')}/>-->
<!--            {/snippet}-->
<!--        </Input>-->
<!--        <Select class="w-[150px]" placeholder="Sort"/>-->
    </div>
<!--    <div class="flex-grow-1 overflow-auto">-->
<!--        <Table class="mt-5" hoverable={true}>-->
<!--            <TableBody>-->
<!--                {#each Object.keys(meshes) as meshId (meshId)}-->
<!--                    {@const mesh = meshes[meshId]}-->
<!--                    <TableBodyRow>-->
<!--                        <TableBodyCell class="p-1">-->
<!--                            <Checkbox/>-->
<!--                        </TableBodyCell>-->
<!--                        <TableBodyCell class="w-full">-->
<!--                            <a-->
<!--                                    href={resolve('/devices/[group_id]', {-->
<!--                                        group_id: encodeURIComponent(mesh.current._id.substring(0)),-->
<!--                                    })}-->
<!--                            >-->
<!--                                {mesh.current.name}-->
<!--                            </a>-->
<!--                        </TableBodyCell>-->
<!--                    </TableBodyRow>-->
<!--                {/each}-->
<!--            </TableBody>-->
<!--        </Table>-->
<!--    </div>-->
    <div class="text-center">(Group Actions)</div>
    {:else}
        <div
                class="flex flex-col m-auto items-center justify-center"
        >
            Loading
        </div>
    {/if}
<!--</div>-->
</Resizable.Pane>
<Resizable.Handle />
{@render children?.()}
