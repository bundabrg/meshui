<script lang="ts">
    import {
        Input,
        Label,
        Helper,
        Button,
        Checkbox,
        A,
        Select,
        CloseButton,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
    } from 'flowbite-svelte';
    import { resolve } from '$app/paths';
    import { mc } from '$lib/meshcentral/meshcentral.svelte.js';

    let { children, data } = $props();
    const meshes = $derived(data.meshes());
</script>

<div class="flex min-w-[380px] flex-col border-e border-e-slate-300 p-3">
    <div class="flex flex-row justify-between pb-10">
        <h1 class="text-4xl">Groups</h1>
        <span>(Selected Actions)</span>
    </div>
    <div class="flex flex-row items-center gap-2 ps-1">
        <my-button
            type="checkbox"
            class="text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 me-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
        ></my-button>
        <Input type="text" placeholder="Filter">
            {#snippet right()}
                <CloseButton onclick={() => (value = '')} />
            {/snippet}
        </Input>
        <Select class="w-[150px]" placeholder="Sort" />
    </div>
    <!--{#await testdata then meshes}-->
    <div class="flex-grow-1 overflow-auto">
        <Table class="mt-5" hoverable={true}>
            <TableBody>
                {#each Object.keys(meshes) as meshId (meshId)}
                    {@const mesh = meshes[meshId]}
                    <TableBodyRow>
                        <TableBodyCell class="p-1">
                            <Checkbox />
                        </TableBodyCell>
                        <TableBodyCell class="w-full">
                            <a
                                href={resolve('/devices/[group_id]', {
                                    group_id: encodeURIComponent(mesh.current._id.substring(0)),
                                })}
                            >
                                {mesh.current.name}
                            </a>
                        </TableBodyCell>
                    </TableBodyRow>
                {/each}
            </TableBody>
        </Table>
    </div>
    <!--{/await}-->
    <div class="text-center">(Group Actions))</div>
</div>
{@render children?.()}
