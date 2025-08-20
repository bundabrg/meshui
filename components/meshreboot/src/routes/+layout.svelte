<script lang="ts">
    import '../app.css';
    import favicon from '$lib/assets/favicon.svg';
    import { ComputerDesktop, Cog, Bars3 } from '@steeze-ui/heroicons';
    import { Icon } from '@steeze-ui/svelte-icon';

    let { children } = $props();
</script>

<svelte:head>
    <link href="/default.css" rel="stylesheet" />
</svelte:head>

<div class="flex h-screen flex-col font-primary lg:flex-row">
    <nav class="flex flex-row items-center bg-[var(--nav-background)] lg:items-start">
        <ul class="grow">
            <li class="hidden p-3 transition hover:bg-[var(--nav-background-hover)] lg:block">
                <a
                    href="/devices"
                    class="flex flex-row items-center justify-items-center text-[var(--nav-text)] lg:flex-col"
                >
                    <Icon class="block" size="2.5em" src={ComputerDesktop} theme="solid" />
                    <span class="block">Devices</span>
                </a>
            </li>
            <li
                class="block p-3 transition lg:rounded-l-lg lg:bg-[var(--nav-background-active)] lg:hover:bg-[var(--nav-background-active-hover)]"
            >
                <a
                    href="/config"
                    class="flex flex-row items-center justify-items-center text-[var(--nav-text)] lg:flex-col lg:text-[var(--nav-text-active)]"
                >
                    <Icon class="block" size="2.5em" src={Cog} theme="solid" />
                    <span
                        class="block ps-5 text-[2em] leading-none lg:ps-0 lg:text-base lg:leading-normal"
                        >Config</span
                    >
                </a>
            </li>
        </ul>
        <Icon class="me-5 text-[var(--nav-text)] lg:hidden" size="2.5em" src={Bars3} />
    </nav>
    <div class="flex w-full flex-col bg-[var(--page-background)] lg:flex-row">
        {@render children?.()}
    </div>
</div>
