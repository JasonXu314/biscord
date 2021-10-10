/// <reference types="@sveltejs/kit" />

type OutboundSocketMsg = {
	CONNECT: ConnectionMsg;
	PONG: PongMsg;
	MESSAGE: MessageMsg;
};

type InboundSocketMsg = {
	PING: PingMsg;
	MESSAGE: MessageRecvMsg;
	USER_JOIN: UserJoinMsg;
	USER_LEAVE: UserLeaveMsg;
};

type EvtListener<T = undefined> = (...evt: T extends undefined ? [] : [T]) => void;
type Unsubscriber = () => void;
type ListenerMap<T extends Record<string, any>> = {
	[E in keyof T]: EvtListener<T[E]>[];
};

type User = {
	name: string;
	id: string;
	avatar: string;
};

type LoginBody = {
	name: string;
	avatar: string;
};

type Message = {
	rawContent: string;
	id: string;
	author: User;
};

type LoginResponse = {
	type: 'success';
	user: User;
	users: User[];
	messages: Message[];
};

type SocketMsg<T> = {
	type: T;
};

type PongMsg = {
	type: 'PONG';
	id: string;
	name: string;
};

type ConnectionMsg = {
	type: 'CONNECT';
	id: string;
	name: string;
};

type MessageMsg = {
	type: 'MESSAGE';
	message: string;
};

type PingMsg = {
	type: 'PING';
};

type MessageRecvMsg = {
	type: 'MESSAGE';
	message: Message;
};

type UserJoinMsg = {
	type: 'USER_JOIN';
	user: User;
};

type UserLeaveMsg = {
	type: 'USER_LEAVE';
	id: string;
};
