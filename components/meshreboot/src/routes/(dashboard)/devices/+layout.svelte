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
    <Table.Root>
<!--        <Table.Header>-->
<!--            <Table.Row>-->
<!--                <Table.Head>Status</Table.Head>-->
<!--            </Table.Row>-->
<!--        </Table.Header>-->
        <Table.Body>
            {#each Object.keys(meshes) as meshId (meshId)}
                {@const mesh = meshes[meshId]}
                <Table.Row>
                    <Table.Cell><Checkbox /></Table.Cell>
                    <Table.Cell class="w-full">
                        <a href={resolve('/(dashboard)/devices/[group_id]', {
                            group_id: encodeURIComponent(mesh.current._id.substring(0))
                        })}>{mesh.current.name}</a>
                    </Table.Cell>
                </Table.Row>
            {/each}
        </Table.Body>
    </Table.Root>
    <div class="text-center">(Group Actions)</div>
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
