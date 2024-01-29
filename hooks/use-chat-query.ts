import qs from "query-string";
import { useInfiniteQuery } from "@tanstack/react-query";

import { useSocket } from "@/components/providers/socket-provider";

//* Aqui haces el fetch de los mensajes

interface ChatQueryProps {
  queryKey: string;
  apiUrl: string;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
}


export const useChatQuery = ({
	queryKey,
	apiUrl,
	paramKey,
	paramValue,
}: ChatQueryProps) => {
	const { isConnected } = useSocket();

	const fetchMessages = async ({ pageParam = undefined }) => {
		const url = qs.stringifyUrl({
			url: apiUrl,
			query: {
				cursor: pageParam,
				[paramKey]: paramValue,
			},
		}, {skipNull: true});

		const res = await fetch(url);
		return res.json();
	};

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		status,
	} = useInfiniteQuery({
		queryKey: [queryKey],
		queryFn: fetchMessages,
		getNextPageParam: (lastPage) => {
			//console.log(lastPage)
			//* este lastPage?.nexCursor se pasa al parametro pageParam del fetchMessages automaticamente y hace que en la siguiente peticion ya tenga un cursor para traer un mensaje desde el ultimo mensaje
			//* lastPage?.nextCursor es igual al id del ultimo mensaje
			return lastPage?.nextCursor
		},
		refetchInterval: isConnected ? false : 1000,
		initialPageParam: undefined,
	});

	//* el data de un useInfiniteQuery tiene esta estructura
	//* el tuData es la data que regresas desde el servidor
	// {
	// 	pageParams: [],
	// 	pages: [
	// 		{...tuData}
	// 	]
	// }
	// data?.pages.map((page) => {
	// 	console.log(page)
	// })


	return {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		status,
	}

}