<script lang="ts">
	export let value: string;
	export let label: string;
	export let onEnter: () => void = () => {};
</script>

<div class="main">
	<input
		class="input"
		class:contentful={value.trim() !== ''}
		id={`input-${label.replace(' ', '-').toLowerCase()}`}
		type="text"
		autocomplete="off"
		bind:value
		on:keypress={(evt) => {
			if (evt.key === 'Enter') {
				onEnter();
			}
		}}
	/>
	<label for={`input-${label.replace(' ', '-').toLowerCase()}`} class="label">{label}</label>
</div>

<style lang="scss">
	.main {
		position: relative;
		margin: 0.5em;

		.input {
			padding: 0.5em;
			text-indent: 4px;
			border: 1px solid #209cee;
			border-radius: 0.5em;
			outline: none;
			box-sizing: content-box;
		}

		.label {
			position: absolute;
			top: calc(0.5em + 1px);
			left: calc(0.5em + 5px);
			font: 400 13.3333px Arial;
			transition: all 250ms ease-in-out;
			pointer-events: none;
		}

		.input.contentful ~ .label,
		.input:focus ~ .label {
			color: #209cee;
			font-size: 0.5em;
			transition: all 250ms ease-in-out;
			background: white;
			top: -0.5em;
			left: 1em;
			padding: 0 0.25em;
		}
	}
</style>
