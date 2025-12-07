import { type HttpClient, httpClient } from "@/service";

export interface ProdListItem {
	prodName: string;
}

export type ProdList = ProdListItem[];

export interface FetchProdListPageRequestPayload {
	t: number;
	prodName: string;
	status: number;
	current: number;
	size: number;
}

export interface FetchProdListPageResponse {
	current: number;
	pages: number;
	records: ProdList;
	size: number;
	total: number;
}

const PROD_LIST_BASE_PATH = "/prod/prod";
const PAGE = `${PROD_LIST_BASE_PATH}/page`;

export function  createProdListApi(client: HttpClient = httpClient) {
	return {
		fetchProdListPage<T = FetchProdListPageResponse>(
			params: FetchProdListPageRequestPayload,
		): Promise<T> {
			const urlParams = Object.entries(params)
				.map(([key, value]) => {
					if (value === undefined || value === null || value === "") {
						return "";
					}
					return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
				})
				.filter(Boolean)
				.join("&");

			const url = urlParams ? `${PAGE}?${urlParams}` : PAGE;
			return client.get<T, T>(url);
		},
	};
}

export const prodListApi =  createProdListApi();
