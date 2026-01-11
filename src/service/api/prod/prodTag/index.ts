import { type HttpClient, httpClient } from "@/service";

export interface ProdTag {
	id?: number;
	title: string;
	shopId?: number;
	status: number; // 0: 禁用, 1: 启用
	isDefault?: number;
	prodCount?: number;
	seq?: number;
	style?: number; // 0: 风格1, 1: 风格2, 2: 风格3
	createTime?: string;
	updateTime?: string;
}

export interface FetchProdTagPageRequestPayload {
	title?: string;
	status?: number;
	current: number;
	size: number;
}

export interface FetchProdTagPageResponse {
	records: ProdTag[];
	total: number;
	size: number;
	current: number;
	pages: number;
}

const PROD_TAG_BASE_PATH = "/prod/prodTag";
const PAGE = `${PROD_TAG_BASE_PATH}/page`;
const INFO = `${PROD_TAG_BASE_PATH}/info`;
const ADD = `${PROD_TAG_BASE_PATH}`;
const UPDATE = `${PROD_TAG_BASE_PATH}`;
const DELETE = `${PROD_TAG_BASE_PATH}`;

export function createProdTagApi(client: HttpClient = httpClient) {
	return {
		fetchProdTagPage<T = FetchProdTagPageResponse>(
			params: FetchProdTagPageRequestPayload,
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
		getProdTagInfo(id: number): Promise<ProdTag> {
			return client.get(`${INFO}/${id}`);
		},
		addProdTag(data: ProdTag): Promise<void> {
			return client.post(ADD, data);
		},
		updateProdTag(data: ProdTag): Promise<void> {
			return client.put(UPDATE, data);
		},
		deleteProdTag(id: number): Promise<void> {
			return client.delete(`${DELETE}/${id}`);
		},
	};
}

export const prodTagApi = createProdTagApi();
