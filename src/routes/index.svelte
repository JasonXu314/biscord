<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import { BACKEND_URL } from '$lib/env';
	import { Socket } from '@nano-utils/web-socket';
	import axios, { AxiosResponse } from 'axios';
	import { onMount } from 'svelte';

	let fileInput: HTMLInputElement,
		name: string = '',
		avatar: string | null = null,
		me: User | null = null,
		socket: Socket<InboundSocketMsg, OutboundSocketMsg> | null = null,
		messages: Message[],
		newMsg: string = '',
		users: User[],
		idsToUsers: Map<string, User>,
		db: IDBDatabase,
		messageBoard: HTMLDivElement,
		inputRow: HTMLDivElement,
		overflowing: boolean = false;

	onMount(() => {
		const req = indexedDB.open('biscord:user-data');

		req.addEventListener('upgradeneeded', () => {
			if (!req.transaction.db.objectStoreNames.contains('user')) {
				req.transaction.db.createObjectStore('user');
			}
		});

		req.addEventListener('success', () => {
			db = req.result;

			const dataReq = db.transaction('user').objectStore('user').getAll(['name', 'avatar']);

			dataReq.addEventListener('success', () => {
				name = dataReq.result[0] || '';
				avatar = dataReq.result[1] || null;
			});
		});
	});

	$: if (db) db.transaction('user', 'readwrite').objectStore('user').put(name, 'name');
	$: if (db) db.transaction('user', 'readwrite').objectStore('user').put(avatar, 'avatar');

	function join() {
		if (name.trim()) {
			axios.post<LoginBody, AxiosResponse<LoginResponse>>(`${BACKEND_URL}/login`, { name, avatar }).then((res) => {
				console.log(res);
				me = res.data.user;
				messages = res.data.messages;
				users = res.data.users;
				idsToUsers = new Map(users.map((user) => [user.id, user]));
				socket = new Socket<InboundSocketMsg, OutboundSocketMsg>(BACKEND_URL.replace('http', 'ws'));

				socket.send({ type: 'CONNECT', id: me.id, name });

				socket.on('PING', () => {
					socket.send({ type: 'PONG', id: me.id, name });
					console.log('ping recieved');
				});

				socket.on('MESSAGE', (msg) => {
					messages = [...messages, msg.message];
					recalculateSize();
				});

				socket.on('USER_JOIN', (msg) => {
					users = [...users, msg.user];
					idsToUsers.set(msg.user.id, msg.user);
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
		if (newMsg.trim()) {
			socket.send({ type: 'MESSAGE', message: newMsg });
			newMsg = '';
		}
	}

	function recalculateSize() {
		const mbHeight = Number(getComputedStyle(messageBoard).height.slice(0, -2));
		const irHeight = Number(getComputedStyle(inputRow).height.slice(0, -2));
		if (mbHeight >= window.innerHeight - irHeight) {
			overflowing = true;
		}
	}
</script>

{#if me}
	<div class="app">
		<div class="message-board" bind:this={messageBoard} class:scroll={overflowing}>
			{#each messages as message}
				<div class="message">
					<div>
						<img src={idsToUsers.get(message.author).avatar} alt={idsToUsers.get(message.author).name} class="avatar" />
					</div>
					<div class="text">
						<h4 class="name">{idsToUsers.get(message.author).name}</h4>
						<span class="message-text">{message.rawContent}</span>
					</div>
				</div>
			{/each}
			<div class="input-row" bind:this={inputRow}>
				<Input bind:value={newMsg} label="Message" onEnter={send} />
				<Button color="blue" on:click={send}>Send</Button>
			</div>
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
	<div>
		<Button color="green" on:click={join}>Join</Button>
	</div>
{/if}

<style lang="scss">
	.app {
		display: grid;
		grid-template-columns: 4fr 1fr;

		.message-board {
			max-height: 100vh;
			box-sizing: border-box;
			padding: 1em;
			padding-bottom: 0;

			.input-row {
				display: flex;
				flex-direction: row;
				position: sticky;
				bottom: 0;
				background: white;
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

			&.scroll {
				overflow-y: scroll;

				&::-webkit-scrollbar {
					width: 0;
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

	:global(body) {
		margin: 0;
	}
</style>
