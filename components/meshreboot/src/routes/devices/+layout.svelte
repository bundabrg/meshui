<script lang="ts">
    import {
        Input, Label, Helper, Button, Checkbox, A, Select, CloseButton,
        Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell
    } from "flowbite-svelte";
    import {mc} from "$lib/meshcentral.svelte";
    import {resolve} from "$app/paths";

    let {children} = $props();
</script>

<div class="flex flex-col p-3 min-w-[380px] border-e border-e-slate-300">
    <div class="flex flex-row justify-between pb-10">
        <h1 class="text-4xl">Groups</h1>
        <span>(Selected Actions)</span>
    </div>
    <div class="flex flex-row items-center gap-2 ps-1">
        <my-button type="checkbox" class="w-4 h-4 bg-gray-100 border-gray-300 dark:ring-offset-gray-800 focus:ring-2 me-2 rounded-sm text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:bg-gray-700 dark:border-gray-600"></my-button>
        <Input type="text" placeholder="Filter">
            {#snippet right()}
                <CloseButton onclick={() => (value = '')} />
            {/snippet}
        </Input>
        <Select class="w-[150px]" placeholder="Sort"/>
    </div>
    <div class="overflow-auto flex-grow-1">
        <Table class="mt-5" hoverable={true}>
            <TableBody>
                {#each mc.meshes as mesh (mesh._id)}
                    <TableBodyRow>
                        <TableBodyCell class="p-1"><Checkbox/></TableBodyCell>
                        <TableBodyCell class="w-full">
                            <a href="{resolve('/devices/[device_id]', {device_id: mesh._id.substring(6)})}">
                                {mesh.name}
                            </a>
                        </TableBodyCell>
                    </TableBodyRow>
                {/each}
            </TableBody>
        </Table>
    </div>
    <div class="text-center">
        (Group Actions))
    </div>
</div>
{@render children?.()}