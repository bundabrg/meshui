<script lang="ts">
    import {resolve} from '$app/paths';
    import {mc} from '$lib/meshcentral/meshcentral.svelte.js';
    import {Input} from "$lib/components/ui/input";
    import {Checkbox} from "$lib/components/ui/checkbox";
    import * as Select from "$lib/components/ui/select/index";
    import * as Resizable from "$lib/components/ui/resizable/index.js";
    import * as Table from "$lib/components/ui/table/index.js";

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const __ensureUsed = { Select, Resizable, Table } as const;

    let {children} = $props();
    const meshes = $derived(mc.meshes);
</script>

<Resizable.Pane>
    {#if mc.loaded}
    <div class="flex flex-col h-screen">
        <div class="flex flex-row justify-between pb-10">
            <h1 class="text-4xl">Groups</h1>
            <span>(Selected Actions)</span>
        </div>
        <div class="flex flex-row items-center gap-2 ps-1">
            <Checkbox />
            <Input class="w-[180px]" type="text" placeholder="Filter" />
            <Select.Root type="single">
                <Select.Trigger class="w-[180px]">Select Something</Select.Trigger>
                <Select.Content>
                    <Select.Item value="1">First Item</Select.Item>
                </Select.Content>
            </Select.Root>
        </div>
        <div class="flex-1  overflow-y-auto">
            <Table.Root>
                <Table.Header>
                    <Table.Row class="bg-muted sticky top-0 z-10">
                        <Table.Head>Status</Table.Head>
                        <Table.Head>2</Table.Head>
                        <Table.Head>3</Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {#each Object.keys(meshes) as meshId (meshId)}
                        {#await meshes[meshId].load() then mesh}
                            <Table.Row>
                                <Table.Cell><Checkbox /></Table.Cell>
                                <Table.Cell class="w-full">
                                    <a href={resolve('/(dashboard)/devices/[group_id]', {
                                group_id: encodeURIComponent(mesh.current._id.substring(0))
                            })}>{mesh.current.name}</a>
                                </Table.Cell>
                                <Table.Cell>{Object.keys(mesh.nodes).length}</Table.Cell>
                            </Table.Row>
                        {/await}
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
{@render children?.()}
