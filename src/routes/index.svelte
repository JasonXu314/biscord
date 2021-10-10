<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import { BACKEND_URL } from '$lib/env';
	import MySocket from '$lib/sock';
	import axios, { AxiosResponse } from 'axios';

	let fileInput: HTMLInputElement,
		name: string = '',
		avatar: string | null = null,
		me: User | null = null,
		socket: MySocket<InboundSocketMsg, OutboundSocketMsg> | null = null,
		messages: Message[],
		newMsg: string = '',
		users: User[];

	function join() {
		if (name && avatar) {
			axios.post<LoginBody, AxiosResponse<LoginResponse>>(`${BACKEND_URL}/login`, { name, avatar }).then((res) => {
				me = res.data.user;
				messages = res.data.messages;
				users = res.data.users;
				socket = new MySocket<InboundSocketMsg, OutboundSocketMsg>(BACKEND_URL.replace('http', 'ws'));

				socket.send({ type: 'CONNECT', id: me.id, name });

				socket.on('PING', () => {
					socket.send({ type: 'PONG', id: me.id, name });
					console.log('ping recieved');
				});

				socket.on('MESSAGE', (msg) => {
					messages = [...messages, msg.message];
					console.log(messages);
				});

				socket.on('USER_JOIN', (msg) => {
					users = [...users, msg.user];
				});

				socket.on('USER_LEAVE', (msg) => {
					users = users.filter((user) => user.id !== msg.id);
				});

				(window as any).socket = socket;
			});
		}
	}

	function setAvatar() {
		const file = fileInput.files.item(0);

		const fr = new FileReader();

		fr.onload = () => {
			avatar = fr.result as string;
		};

		fr.readAsDataURL(file);
	}

	function send() {
		socket.send({ type: 'MESSAGE', message: newMsg });
		newMsg = '';
	}
</script>

{#if me}
	<div class="app">
		<div class="message-board">
			<div class="input-row">
				<Input bind:value={newMsg} label="Message" onEnter={send} />
				<Button color="blue" on:click={send}>Send</Button>
			</div>
			{#each messages as message}
				<div class="message">
					<div>
						<img src={message.author.avatar} alt={message.author.name} class="avatar" />
					</div>
					<div class="text">
						<h4 class="name">{message.author.name}</h4>
						<span class="message-text">{message.rawContent}</span>
					</div>
				</div>
			{/each}
		</div>
		<div class="user-list">
			{#each users as user}
				<div class="user">
					<div>
						<img src={user.avatar} alt={user.name} class="avatar" />
					</div>
					<h4 class="name">{user.name}</h4>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<Input bind:value={name} label="Name" />
	<input type="file" bind:this={fileInput} on:change={setAvatar} />
	<Button color="green" on:click={join}>Join</Button>
{/if}

<style lang="scss">
	.app {
		display: grid;
		grid-template-columns: 4fr 1fr;

		.message-board {
			.input-row {
				display: flex;
				flex-direction: row;
			}

			.message {
				display: grid;
				grid-template-columns: min-content 1fr;

				.avatar {
					height: 4em;
					width: 4em;
					border-radius: 50%;
				}

				.text {
					display: grid;
					grid-template-rows: min-content 1fr;

					.name {
						margin: 0.25em 0.5em;
					}

					.message-text {
						margin: 0.25em 0.5em;
					}
				}
			}
		}

		.user-list {
			.user {
				display: grid;
				grid-template-columns: min-content 1fr;

				.avatar {
					height: 4em;
					width: 4em;
					border-radius: 50%;
				}

				.name {
					margin: auto 1em;
				}
			}
		}
	}
</style>
