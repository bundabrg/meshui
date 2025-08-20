<script lang="ts">
    import {
        Input, Label, Helper, Button, Checkbox, A, Select, CloseButton,
        Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell
    } from "flowbite-svelte";
    import {Cog, UserCircle, ComputerDesktop, LockClosed} from "@steeze-ui/heroicons";
    import {Icon} from "@steeze-ui/svelte-icon";

    let {children, data} = $props();
    const mesh = $derived(data.mesh());
    $inspect(mesh);

</script>
<div class="flex flex-col flex-grow-1 p-3 min-w-[500px] bg-white border-e border-e-slate-300">
    <div class="flex flex-row justify-between pb-10">
        <h1 class="text-4xl">Devices</h1>
        <span>(Selected Actions)</span>
    </div>
    <div class="flex flex-row items-center gap-2 ps-1">
        <my-button type="checkbox"
                   class="w-4 h-4 bg-gray-100 border-gray-300 dark:ring-offset-gray-800 focus:ring-2 me-2 rounded-sm text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:bg-gray-700 dark:border-gray-600"></my-button>
        <Input type="text" placeholder="Filter">
            {#snippet right()}
                <CloseButton onclick={() => (value = '')}/>
            {/snippet}
        </Input>
        <Select class="w-[200px]" placeholder="Status"/>
        <Select class="w-[150px]" placeholder="Sort"/>
    </div>
    <div class="overflow-auto flex-grow-1">
        <Table class="mt-5" hoverable={true}>
            <TableBody>
                {#each Object.keys(mesh.nodes) as nodeId (nodeId)}
                    {@const node = mesh.nodes[nodeId]}
                    {@const node_sessions = Object.keys(node.current.sessions?.kvm??{}).length}
                    <TableBodyRow>
                        <TableBodyCell class="p-1">
                            <Checkbox/>
                        </TableBodyCell>
                        <TableBodyCell class="w-full">
                            <h2 class="font-bold">{node.current.name}</h2>
                            <span>{node.current.desc || node.current.osdesc}</span><br>
                            <span>User: {node.current.users?.join(', ')}</span>
                        </TableBodyCell>
                        <TableBodyCell class="text-gray-300">
                            <Icon size="3em" src="{UserCircle}" theme="solid" class={['inline', node_sessions && 'text-blue-500']}/>
                            <Icon size="3em" src="{ComputerDesktop}" theme="solid"
                                  class={['inline', node.current.conn && 'text-green-800']}/>
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