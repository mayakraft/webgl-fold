<script>
	export let pageIndex = 0;
	export let pageNames = [];

</script>
<div class="background">
	<div class="popup">
		<div class="title-bar">
			<slot name=title-bar />
		</div>
		<div class="center">
			<div class="canvas">
				<slot name="canvas" />
			</div>
		</div>
		<hr />
		<div class="body">
			{#if pageIndex === 0}
				<slot name="page-0" />
			{/if}
			{#if pageIndex === 1}
				<slot name="page-1" />
			{/if}
			{#if pageIndex === 2}
				<slot name="page-2" />
			{/if}
			{#if pageIndex === 3}
				<slot name="page-3" />
			{/if}
			{#if pageIndex === 4}
				<slot name="page-4" />
			{/if}
		</div>
		<div class="tab-bar">
			{#each pageNames as name, i}
				<button on:click={() => pageIndex = i}>{name}</button>
			{/each}
		</div>
	</div>
</div>

<style>
	:global(body) .background { background-color: #fffa; }
	:global(body.dark) .background { background-color: #0006; }
	:global(body) .popup {
		background-color: #fff;
		box-shadow: 0 0 1rem #666;
	}
	:global(body.dark) .popup {
		background-color: #222;
		box-shadow: 0 0 1rem black;
	}
	:global(body) .title-bar { background-color: #ddd; }
	:global(body.dark) .title-bar { background-color: #333; }
	:global(body) .tab-bar > * { background-color: #ddd; }
	:global(body.dark) .tab-bar > * { background-color: #333; }
	:global(body) button { color: black; }
	:global(body.dark) button { color: #39f; }
	:global(body) button:hover { color: #39f; }
	:global(body.dark) button:hover { color: white; }
	:global(body) hr { background-color: #ddd; }
	:global(body.dark) hr { background-color: #666; }

	button {
		border: none;
		font-weight: bold;
	  transition: color 0.25s;
	}
	button:hover {
		transition: border-color 0s;
	}
	button:focus,
	button:focus-visible {
		outline: 4px auto -webkit-focus-ring-color;
	}
	.background {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 5;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0;
		padding: 0;
	}
	.popup {
		border-radius: 1rem;
		overflow: hidden;
		z-index: 6;
		width: 20rem;
		max-width: 80vw;
	}
	.popup > * {
		padding: 0.5rem;
	}
	.popup > hr {
		border: 0;
		height: 2px;
		width: 100%;
		margin: 0;
		padding: 0;
	}
	.title-bar {
		text-align: right;
	}
	.tab-bar {
		display: flex;
		flex-direction: row;
		align-items: space-evenly;
		padding: 0;
		gap: 2px;
	}
	.tab-bar > * {
		width: 100%;
		height: 3rem;
		border: 0;
		border-radius: 0;
	}
	.center {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.canvas {
		width: 50vmax;
		height: 50vmax;
		max-width: 33vh;
		max-height: 33vh;
		background-color: #fff;
	}
</style>
