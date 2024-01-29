import { useQueryClient } from "@tanstack/react-query";


import { useSocket } from "@/components/providers/socket-provider";
import { useEffect } from "react";
import { Member, Message, Profile } from "@prisma/client";


//* Aqui se capturan los eventos emitidos del servidor y actualiza la data


type ChatSocketProps = {
	addKey: string;
  updateKey: string;
  queryKey: string;
}

type MessageWithMemberWithProfile = Message & {
	member: Member & {
		profile: Profile;
	}
}

export const useChatSocket = ({
	addKey,
	updateKey,
	queryKey,
}: ChatSocketProps) => {
	const { socket } = useSocket();
	const queryClient = useQueryClient();

	useEffect(() => {
		if(!socket) {
			return;
		}

		socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
			queryClient.setQueryData([queryKey], (olData: any) => {
				if(!olData || !olData.pages || olData.pages.length === 0  ){
					return olData;
				}

				const newData = olData.pages.map((page:any) => {
					return {
						...page,
						items: page.items.map((item: MessageWithMemberWithProfile) =>{
							if(item.id === message.id){
								return message;
							}

							return item;
						})
					}
				})

				return {
					...olData,
					pages: newData,
				}
			})
		});

		socket.on(addKey, (message: MessageWithMemberWithProfile) => {
			queryClient.setQueryData([queryKey], (olData: any) => {
				if(!olData || !olData.pages || olData.pages.length === 0  ){
					return {
						pages: [{
							items: [message]
						}]
					};
				}

				const newData = [...olData.pages];

				newData[0] = {
					...newData[0],
					items: [
						message,
						...newData[0].items,
					]
				}

				return {
					...olData,
					pages: newData,
				}
			})
		})

		return () => {
			socket.off(addKey);
			socket.off(updateKey);
		}
	}, [queryClient, addKey, queryKey, socket, updateKey])
}