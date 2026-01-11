import { type HttpClient, httpClient } from "@/service";

export interface ProdListItem {
	prodId: number;
	prodName: string;
	oriPrice: number;
	price: number;
	totalStocks: number;
	pic: string;
	status: number; // 0: 上架, 1: 下架
	imgs?: string; // 逗号分隔的图片列表
}

export type ProdList = ProdListItem[];

export interface FetchProdListPageRequestPayload {
	prodName?: string;
	status?: number;
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
const DELETE = `${PROD_LIST_BASE_PATH}`;

export function createProdListApi(client: HttpClient = httpClient) {
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
		deleteProd(prodIds: number[]): Promise<void> {
			return client.delete(DELETE, { data: prodIds });
		},
	};
}

export const prodListApi = createProdListApi();