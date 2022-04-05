<script>
	import { isLoading, _, locale, locales } from 'svelte-i18n';
</script>

<main>
	<img alt="svelte logo" src="img/svelte-logo.png" />
	{#if $isLoading}
		<p>
			loading translations...
		</p>
	{:else}
		<h1>{$_('welcome')}</h1>
		<p>{@html $_('descr', { values: { link: `<a href="https://svelte.dev/tutorial" target="_blank">${$_('doc')}</a>` } })}</p>
		<p>{$_('endd', { default: 'Have fun!' })}</p>
		<select bind:value={$locale}>
			{#each $locales as locale}
				<option value={locale}>{locale}</option>
			{/each}
		</select>
	{/if}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>