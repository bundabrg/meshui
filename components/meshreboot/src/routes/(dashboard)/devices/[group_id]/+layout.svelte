<script lang="ts">
    import {Cog, UserCircle, ComputerDesktop, LockClosed} from '@steeze-ui/heroicons';
    import {Icon} from '@steeze-ui/svelte-icon';
    import {resolve} from '$app/paths';
    import {goto} from '$app/navigation';
    import {page} from "$app/state";
    import {mc} from "$lib/meshcentral/meshcentral.svelte";
    import * as Resizable from "$lib/components/ui/resizable/index.js";
    import * as Select from "$lib/components/ui/select/index";
    import * as Table from "$lib/components/ui/table/index.js";
    import {Checkbox} from "$lib/components/ui/checkbox";
    import {Input} from "$lib/components/ui/input";

    let {children} = $props();
    const meshes = $derived(mc.meshes);
    const mesh = $derived(page.params.group_id ? meshes[page.params.group_id] : null);

    $effect(() => {
        // If mesh is deleted or invalid then redirect
        if (mc.loaded) {
            if (mesh) {
                mesh.load();
            }

            if (!mesh || !(mesh.current._id in meshes)) {
                goto(resolve('/devices'));
            }
        }
    });
</script>

<Resizable.Pane>
    {#if mesh?.loaded }
        <div class="flex flex-col h-screen">
            <div class="flex flex-row justify-between pb-10">
                <h1 class="text-4xl">Devices</h1>
                <span>(Selected Actions)</span>
            </div>
            <div class="flex flex-row items-center gap-2 ps-1">
                <Checkbox />
                <Input class="w-[180px]" type="text" placeholder="Filter" />
                <Select.Root type="single">
                    <Select.Trigger class="w-[180px]">Status</Select.Trigger>
                    <Select.Content>
                        <Select.Item value="1">First Item</Select.Item>
                    </Select.Content>
                </Select.Root>
                <Select.Root type="single">
                    <Select.Trigger class="w-[180px]">Sort</Select.Trigger>
                    <Select.Content>
                        <Select.Item value="1">First Item</Select.Item>
                    </Select.Content>
                </Select.Root>
            </div>
            <div class="flex-1  overflow-y-auto">
                <Table.Root>
                    <!--        <Table.Header>-->
                    <!--            <Table.Row>-->
                    <!--                <Table.Head>Status</Table.Head>-->
                    <!--            </Table.Row>-->
                    <!--        </Table.Header>-->
                    <Table.Body>
                        {#each Object.keys(mesh.nodes ?? []) as nodeId (nodeId)}
                            {@const node = mesh.nodes[nodeId]}
                            {@const node_sessions = Object.keys(node.current.sessions?.kvm ?? {}).length}
                            <Table.Row>
                                <Table.Cell><Checkbox/></Table.Cell>
                                <Table.Cell>
                                    <a
                                            href={resolve('/(dashboard)/devices/[group_id]/[node_id]', {
                                                group_id: encodeURIComponent(mesh.current._id),
                                                node_id: encodeURIComponent(node.current._id),
                                            })}
                                    >
                                        <h2 class="font-bold">{node.current.name}</h2>
                                        <span>{node.current.desc || node.current.osdesc}</span><br/>
                                        <span>User: {node.current.users?.join(', ')}</span>
                                    </a>
                                </Table.Cell>
                                <Table.Cell>
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
                                </Table.Cell>
                            </Table.Row>
                        {/each}
                    </Table.Body>
                </Table.Root>
            </div>
            <div class="pb-[100px] border-t-2 text-center">(Group Actions)</div>
        </div>
    {:else}
        <div
                class="flex flex-col m-auto items-center justify-center"
        >
            Loading
        </div>
    {/if}

</Resizable.Pane>
<Resizable.Handle />
<!--<div class="flex min-w-[500px] flex-grow-1 flex-col border-e border-e-slate-300 bg-white p-3">-->
<!--    {#if mesh?.loaded }-->
<!--        <div class="flex flex-row justify-between pb-10">-->
<!--            <h1 class="text-4xl">Devices</h1>-->
<!--            <span>(Selected Actions)</span>-->
<!--        </div>-->
<!--        <div class="flex flex-row items-center gap-2 ps-1">-->
<!--            <my-button-->
<!--                    type="checkbox"-->
<!--                    class="text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 me-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"-->
<!--            ></my-button>-->
<!--            <Input type="text" placeholder="Filter">-->
<!--                {#snippet right()}-->
<!--                    <CloseButton onclick={() => (value = '')}/>-->
<!--                {/snippet}-->
<!--            </Input>-->
<!--            <Select class="w-[200px]" placeholder="Status"/>-->
<!--            <Select class="w-[150px]" placeholder="Sort"/>-->
<!--        </div>-->
<!--        <div class="flex-grow-1 overflow-auto">-->
<!--            <Table class="mt-5" hoverable={true}>-->
<!--                <TableBody>-->
<!--                    {#each Object.keys(mesh.nodes ?? []) as nodeId (nodeId)}-->
<!--                        {@const node = mesh.nodes[nodeId]}-->
<!--                        {@const node_sessions = Object.keys(node.current.sessions?.kvm ?? {}).length}-->
<!--                        <TableBodyRow>-->
<!--                            <TableBodyCell class="p-1">-->
<!--                                <Checkbox/>-->
<!--                            </TableBodyCell>-->
<!--                            <TableBodyCell class="w-full">-->
<!--                                <a-->
<!--                                        href={resolve('/devices/[group_id]/[node_id]', {-->
<!--                                            group_id: encodeURIComponent(mesh.current._id),-->
<!--                                            node_id: encodeURIComponent(node.current._id),-->
<!--                                        })}-->
<!--                                >-->
<!--                                    <h2 class="font-bold">{node.current.name}</h2>-->
<!--                                    <span>{node.current.desc || node.current.osdesc}</span><br/>-->
<!--                                    <span>User: {node.current.users?.join(', ')}</span>-->
<!--                                </a>-->
<!--                            </TableBodyCell>-->
<!--                            <TableBodyCell class="text-gray-300">-->
<!--                                <Icon-->
<!--                                        size="3em"-->
<!--                                        src={UserCircle}-->
<!--                                        theme="solid"-->
<!--                                        class={['inline', node_sessions && 'text-blue-500']}-->
<!--                                />-->
<!--                                <Icon-->
<!--                                        size="3em"-->
<!--                                        src={ComputerDesktop}-->
<!--                                        theme="solid"-->
<!--                                        class={['inline', node.current.conn && 'text-green-800']}-->
<!--                                />-->
<!--                            </TableBodyCell>-->
<!--                        </TableBodyRow>-->
<!--                    {/each}-->
<!--                </TableBody>-->
<!--            </Table>-->
<!--        </div>-->
<!--        <div class="text-center">(Group Actions)</div>-->
<!--    {:else}-->
<!--        <div-->
<!--                class="flex flex-col m-auto items-center justify-center"-->
<!--        >-->
<!--            Loading-->
<!--        </div>-->
<!--    {/if}-->
<!--</div>-->
{@render children?.()}
