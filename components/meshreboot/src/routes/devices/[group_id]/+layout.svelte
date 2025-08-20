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
    import { Cog, UserCircle, ComputerDesktop, LockClosed } from '@steeze-ui/heroicons';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { resolve } from '$app/paths';
    import { goto } from '$app/navigation';

    let { children, data } = $props();
    const mesh = $derived(data.mesh());
    const meshes = $derived(data.meshes());

    $effect(() => {
        // If mesh is deleted then redirect
        if (!(mesh.current._id in meshes)) {
            goto(resolve('/devices'));
        }
    });
</script>

<div class="flex min-w-[500px] flex-grow-1 flex-col border-e border-e-slate-300 bg-white p-3">
    <div class="flex flex-row justify-between pb-10">
        <h1 class="text-4xl">Devices</h1>
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
        <Select class="w-[200px]" placeholder="Status" />
        <Select class="w-[150px]" placeholder="Sort" />
    </div>
    <div class="flex-grow-1 overflow-auto">
        <Table class="mt-5" hoverable={true}>
            <TableBody>
                {#each Object.keys(mesh.nodes) as nodeId (nodeId)}
                    {@const node = mesh.nodes[nodeId]}
                    {@const node_sessions = Object.keys(node.current.sessions?.kvm ?? {}).length}
                    <TableBodyRow>
                        <TableBodyCell class="p-1">
                            <Checkbox />
                        </TableBodyCell>
                        <TableBodyCell class="w-full">
                            <a
                                href={resolve('/devices/[group_id]/[node_id]', {
                                    group_id: encodeURIComponent(mesh.current._id),
                                    node_id: encodeURIComponent(node.current._id),
                                })}
                            >
                                <h2 class="font-bold">{node.current.name}</h2>
                                <span>{node.current.desc || node.current.osdesc}</span><br />
                                <span>User: {node.current.users?.join(', ')}</span>
                            </a>
                        </TableBodyCell>
                        <TableBodyCell class="text-gray-300">
                            <Icon
                                size="3em"
                                src={UserCircle}
                                theme="solid"
                                class={['inline', node_sessions && 'text-blue-500']}
                            />
                            <Icon
                                size="3em"
                                src={ComputerDesktop}
                                theme="solid"
                                class={['inline', node.current.conn && 'text-green-800']}
                            />
                        </TableBodyCell>
                    </TableBodyRow>
                {/each}
            </TableBody>
        </Table>
    </div>
    <div class="text-center">(Group Actions))</div>
</div>
{@render children?.()}
