<script lang="ts">
    import '../app.css';
    import favicon from '$lib/assets/favicon.svg';
    import {ComputerDesktop, Cog, Bars3} from "@steeze-ui/heroicons";
    import {Icon} from "@steeze-ui/svelte-icon";

    let {children} = $props();
</script>

<svelte:head>
    <link
            href="/default.css"
            rel="stylesheet"
    />
</svelte:head>

<div class="h-screen flex flex-col lg:flex-row font-primary">
    <nav class="flex flex-row bg-[var(--nav-background)] items-center lg:items-start">
        <ul class="grow">
            <li class="p-3 hidden lg:block hover:bg-[var(--nav-background-hover)] transition">
                <a href="/devices"
                   class="flex flex-row lg:flex-col justify-items-center items-center text-[var(--nav-text)]">
                    <Icon class="block" size="2.5em" src="{ComputerDesktop}" theme="solid"/>
                    <span class="block">Devices</span>
                </a>
            </li>
            <li class="lg:bg-[var(--nav-background-active)] lg:hover:bg-[var(--nav-background-active-hover)] p-3 lg:rounded-l-lg block transition">
                <a href="/config"
                   class="flex flex-row lg:flex-col justify-items-center items-center text-[var(--nav-text)] lg:text-[var(--nav-text-active)]">
                    <Icon class="block" size="2.5em" src="{Cog}" theme="solid"/>
                    <span class="block ps-5 lg:ps-0 text-[2em] lg:text-base leading-none lg:leading-normal">Config</span>
                </a>
            </li>
        </ul>
        <Icon class="lg:hidden text-[var(--nav-text)] me-5" size="2.5em" src="{Bars3}"/>
    </nav>
    <div class="bg-[var(--page-background)] w-full flex flex-col lg:flex-row">
        {@render children?.()}
    </div>
</div>