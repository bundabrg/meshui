<script lang="ts">
    import favicon from '$lib/assets/favicon.svg';
    import { ComputerDesktop, Cog, Bars3 } from '@steeze-ui/heroicons';
    import { Icon } from '@steeze-ui/svelte-icon';

    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import * as Resizable from "$lib/components/ui/resizable/index.js";


    let { children } = $props();

    import { useSidebar } from "$lib/components/ui/sidebar/index.js";

    const sidebar = $derived(useSidebar());

</script>

<!--<svelte:head>-->
<!--    <link href="/default.css" rel="stylesheet" />-->
<!--</svelte:head>-->

<Sidebar.Provider>
    <Sidebar.Root collapsible="icon" variant="sidebar">
<!--        <Sidebar.Header>Header</Sidebar.Header>-->
        <Sidebar.Content>
            <Sidebar.Group>
<!--                <Sidebar.GroupLabel>Application</Sidebar.GroupLabel>-->
                <Sidebar.Menu>
                    <Sidebar.MenuItem>
                        <Sidebar.MenuButton>
                            {#snippet child({ props })}
                                <a href="/devices" {...props}>
                                    <Icon src={ComputerDesktop} theme="solid" />
                                    <span>Devices</span>
                                </a>
                            {/snippet}
                        </Sidebar.MenuButton>
                    </Sidebar.MenuItem>
                    <Sidebar.MenuItem>
                        <Sidebar.MenuButton>
                            {#snippet child({ props })}
                                <a href="/config" {...props}>
                                    <Icon src={Cog} theme="solid" />
                                    <span>Config</span>
                                </a>
                            {/snippet}
                        </Sidebar.MenuButton>
                    </Sidebar.MenuItem>
                </Sidebar.Menu>
            </Sidebar.Group>
        </Sidebar.Content>
<!--        <Sidebar.Footer>Footer</Sidebar.Footer>-->
    </Sidebar.Root>
<!--    class="flex w-full flex-col bg-[var(&#45;&#45;page-background)] dark:bg-[var(&#45;&#45;page-background-dark)] text-[var(&#45;&#45;text-color)] dark:text-[var(&#45;&#45;text-color-dark)] lg:flex-row"-->
    <main class="w-full">
        <Sidebar.Trigger />
        <Resizable.PaneGroup direction="horizontal">
        {@render children?.()}
        </Resizable.PaneGroup>
    </main>
</Sidebar.Provider>

<!--<div class="flex h-screen flex-col font-primary lg:flex-row">-->
<!--    <nav class="flex flex-row items-center bg-[var(&#45;&#45;nav-background)] lg:items-start">-->
<!--        <ul class="grow">-->
<!--            <li class="hidden p-3 transition hover:bg-[var(&#45;&#45;nav-background-hover)] lg:block">-->
<!--                <a-->
<!--                    href="/devices"-->
<!--                    class="flex flex-row items-center justify-items-center text-[var(&#45;&#45;nav-text-color)] lg:flex-col"-->
<!--                >-->
<!--                    <Icon class="block" size="2.5em" src={ComputerDesktop} theme="solid" />-->
<!--                    <span class="block">Devices</span>-->
<!--                </a>-->
<!--            </li>-->
<!--            <li-->
<!--                class="block p-3 transition lg:rounded-l-lg lg:bg-[var(&#45;&#45;nav-background-active)] lg:dark:bg-[var(&#45;&#45;nav-background-active-dark)] lg:hover:bg-[var(&#45;&#45;nav-background-active-hover)] lg:hover:dark:bg-[var(&#45;&#45;nav-background-active-hover-dark)]"-->
<!--            >-->
<!--                <a-->
<!--                    href="/config"-->
<!--                    class="flex flex-row items-center justify-items-center text-[var(&#45;&#45;nav-text-color)] lg:flex-col lg:text-[var(&#45;&#45;nav-text-color-active)] lg:dark:text-[var(&#45;&#45;nav-text-color-active-dark)]"-->
<!--                >-->
<!--                    <Icon class="block" size="2.5em" src={Cog} theme="solid" />-->
<!--                    <span-->
<!--                        class="block ps-5 text-[2em] leading-none lg:ps-0 lg:text-base lg:leading-normal"-->
<!--                        >Config</span-->
<!--                    >-->
<!--                </a>-->
<!--            </li>-->
<!--        </ul>-->
<!--        <Icon class="me-5 text-[var(&#45;&#45;nav-text-color)] lg:hidden" size="2.5em" src={Bars3} />-->
<!--    </nav>-->
<!--    <div class="flex w-full flex-col bg-[var(&#45;&#45;page-background)] dark:bg-[var(&#45;&#45;page-background-dark)] text-[var(&#45;&#45;text-color)] dark:text-[var(&#45;&#45;text-color-dark)] lg:flex-row">-->
<!--        {@render children?.()}-->
<!--    </div>-->
<!--</div>-->
